import cloudinary from "../../config/cloudinary";
import File, { IFile } from "./file.model";
import { Types, FilterQuery } from "mongoose";
import CustomError from "../../utils/customError";

// Type for Cloudinary upload result
interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: string;
  bytes: number;
  format: string;
  original_filename: string;
  folder?: string;
  [key: string]: any;
}

// Type for file metadata
interface FileMetadata {
  uploadedBy?: string;
  associatedModel?: string;
  associatedId?: string;
  folder?: string;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export class FileService {
  /**
   * Save file metadata to MongoDB after Cloudinary upload
   * Use this after multer-storage-cloudinary has already uploaded the file
   */
  async saveFileMetadata(
    file: Express.Multer.File,
    options: FileMetadata = {}
  ): Promise<IFile> {
    // The file object from multer-storage-cloudinary contains:
    // - path: the Cloudinary URL
    // - filename: the public_id
    const fileDoc = new File({
      filename: file.filename,
      originalName: file.originalname,
      url: file.path, // Cloudinary URL is stored in path by multer-storage-cloudinary
      publicId: file.filename,
      mimetype: file.mimetype,
      size: file.size,
      resourceType: file.mimetype.startsWith("image/") ? "image" : "raw",
      folder: options.folder || "uploads",
      uploadedBy: options.uploadedBy
        ? new Types.ObjectId(options.uploadedBy)
        : undefined,
      associatedModel: options.associatedModel,
      associatedId: options.associatedId
        ? new Types.ObjectId(options.associatedId)
        : undefined,
      isPublic: options.isPublic ?? true,
      metadata: options.metadata,
    });

    return await fileDoc.save();
  }

  /**
   * Upload a file directly to Cloudinary from buffer
   * Use this when you need more control over the upload process
   */
  async uploadToCloudinary(
    buffer: Buffer,
    options: {
      folder?: string;
      resourceType?: "image" | "raw" | "video" | "auto";
      publicId?: string;
      transformation?: any[];
    } = {}
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder || "uploads",
          resource_type: options.resourceType || "auto",
          public_id: options.publicId,
          transformation: options.transformation,
        },
        (error, result) => {
          if (error) {
            reject(new CustomError(`Cloudinary upload failed: ${error.message}`, 500));
          } else if (result) {
            resolve(result as CloudinaryUploadResult);
          } else {
            reject(new CustomError("Cloudinary upload returned no result", 500));
          }
        }
      );

      uploadStream.end(buffer);
    });
  }

  /**
   * Upload a file from buffer and save metadata to MongoDB
   */
  async uploadAndSave(
    buffer: Buffer,
    originalName: string,
    mimetype: string,
    options: FileMetadata & {
      transformation?: any[];
    } = {}
  ): Promise<IFile> {
    const isImage = mimetype.startsWith("image/");
    const folder = options.folder || "uploads";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const baseName = originalName.replace(/\.[^/.]+$/, "");
    const publicId = `${baseName}-${uniqueSuffix}`;

    const cloudinaryResult = await this.uploadToCloudinary(buffer, {
      folder: isImage ? `${folder}/images` : `${folder}/documents`,
      resourceType: isImage ? "image" : "raw",
      publicId,
      transformation: options.transformation,
    });

    const fileDoc = new File({
      filename: cloudinaryResult.public_id,
      originalName,
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      mimetype,
      size: cloudinaryResult.bytes,
      resourceType: cloudinaryResult.resource_type as "image" | "raw" | "video" | "auto",
      folder: cloudinaryResult.folder || folder,
      uploadedBy: options.uploadedBy
        ? new Types.ObjectId(options.uploadedBy)
        : undefined,
      associatedModel: options.associatedModel,
      associatedId: options.associatedId
        ? new Types.ObjectId(options.associatedId)
        : undefined,
      isPublic: options.isPublic ?? true,
      metadata: options.metadata,
    });

    return await fileDoc.save();
  }

  /**
   * Get file by ID
   */
  async getById(id: string): Promise<IFile | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return await File.findById(id);
  }

  /**
   * Get file by public ID
   */
  async getByPublicId(publicId: string): Promise<IFile | null> {
    return await File.findOne({ publicId });
  }

  /**
   * Get files with pagination
   */
  async get(
    filter: FilterQuery<IFile> = {},
    options: { offset?: number; limit?: number } = {}
  ): Promise<{
    files: IFile[];
    total: number;
    offset: number;
    limit: number;
  }> {
    const offset = Math.max(0, options.offset || 0);
    const limit = Math.max(1, options.limit || 10);

    const [files, total] = await Promise.all([
      File.find(filter).skip(offset).limit(limit).sort({ createdAt: -1 }),
      File.countDocuments(filter),
    ]);

    return { files, total, offset, limit };
  }

  /**
   * Get files by uploader
   */
  async getByUploader(
    uploaderId: string,
    options: { offset?: number; limit?: number } = {}
  ): Promise<{
    files: IFile[];
    total: number;
    offset: number;
    limit: number;
  }> {
    if (!Types.ObjectId.isValid(uploaderId)) {
      return { files: [], total: 0, offset: 0, limit: options.limit || 10 };
    }
    return this.get({ uploadedBy: new Types.ObjectId(uploaderId) }, options);
  }

  /**
   * Get files associated with a specific model and document
   */
  async getByAssociation(
    model: string,
    documentId: string,
    options: { offset?: number; limit?: number } = {}
  ): Promise<{
    files: IFile[];
    total: number;
    offset: number;
    limit: number;
  }> {
    if (!Types.ObjectId.isValid(documentId)) {
      return { files: [], total: 0, offset: 0, limit: options.limit || 10 };
    }
    return this.get(
      {
        associatedModel: model,
        associatedId: new Types.ObjectId(documentId),
      },
      options
    );
  }

  /**
   * Delete a file from both Cloudinary and MongoDB
   */
  async delete(id: string): Promise<IFile | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const file = await File.findById(id);
    if (!file) return null;

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(file.publicId, {
        resource_type: file.resourceType === "image" ? "image" : "raw",
      });
    } catch (error) {
      console.error(`Failed to delete file from Cloudinary: ${file.publicId}`, error);
      // Continue with MongoDB deletion even if Cloudinary fails
    }

    // Delete from MongoDB
    return await File.findByIdAndDelete(id);
  }

  /**
   * Delete a file by public ID
   */
  async deleteByPublicId(publicId: string): Promise<IFile | null> {
    const file = await File.findOne({ publicId });
    if (!file) return null;

    return this.delete(file._id.toString());
  }

  /**
   * Delete multiple files
   */
  async deleteMany(ids: string[]): Promise<{ deleted: number; failed: number }> {
    let deleted = 0;
    let failed = 0;

    for (const id of ids) {
      const result = await this.delete(id);
      if (result) {
        deleted++;
      } else {
        failed++;
      }
    }

    return { deleted, failed };
  }

  /**
   * Update file metadata (does not change the actual file)
   */
  async updateMetadata(
    id: string,
    updates: Partial<Pick<IFile, "associatedModel" | "associatedId" | "metadata" | "isPublic">>
  ): Promise<IFile | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    return await File.findByIdAndUpdate(id, updates, { new: true });
  }

  /**
   * Generate a signed URL for private file access
   * Expires in 1 hour by default
   */
  generateSignedUrl(publicId: string, options: { expiresIn?: number } = {}): string {
    const expiresAt = Math.floor(Date.now() / 1000) + (options.expiresIn || 3600);

    return cloudinary.url(publicId, {
      sign_url: true,
      type: "authenticated",
      expires_at: expiresAt,
    });
  }

  /**
   * Get image URL with transformations
   */
  getTransformedImageUrl(
    publicId: string,
    transformations: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string | number;
      format?: string;
    }
  ): string {
    return cloudinary.url(publicId, {
      transformation: [
        {
          width: transformations.width,
          height: transformations.height,
          crop: transformations.crop || "fill",
          quality: transformations.quality || "auto",
          fetch_format: transformations.format || "auto",
        },
      ],
    });
  }
}

export default new FileService();
