import { Request, Response } from "express";
import FileService from "./file.service";
import asyncHandler from "../../utils/asyncHandler";
import CustomError from "../../utils/customError";

export class FileController {
  /**
   * Upload a single file
   * POST /api/file/upload
   * Body (form-data): file
   * Optional body fields: folder, associatedModel, associatedId
   */
  uploadSingle = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new CustomError("No file uploaded", 400);
    }

    const { folder, associatedModel, associatedId } = req.body;
    const userId = req.user?.id;

    const file = await FileService.saveFileMetadata(req.file, {
      uploadedBy: userId,
      folder: folder || undefined,
      associatedModel,
      associatedId,
    });

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        id: file._id,
        url: file.url,
        publicId: file.publicId,
        filename: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
      },
    });
  });

  /**
   * Upload multiple files
   * POST /api/file/upload-multiple
   * Body (form-data): files (array)
   * Optional body fields: folder, associatedModel, associatedId
   */
  uploadMultiple = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      throw new CustomError("No files uploaded", 400);
    }

    const { folder, associatedModel, associatedId } = req.body;
    const userId = req.user?.id;

    const uploadedFiles = await Promise.all(
      files.map((file) =>
        FileService.saveFileMetadata(file, {
          uploadedBy: userId,
          folder: folder || undefined,
          associatedModel,
          associatedId,
        })
      )
    );

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: uploadedFiles.map((file) => ({
        id: file._id,
        url: file.url,
        publicId: file.publicId,
        filename: file.originalName,
        mimetype: file.mimetype,
        size: file.size,
      })),
    });
  });

  /**
   * Get file by ID
   * GET /api/file/:id
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const file = await FileService.getById(req.params.id);
    
    if (!file) {
      throw new CustomError("File not found", 404);
    }

    res.status(200).json({
      success: true,
      data: file,
    });
  });

  /**
   * Get files with pagination
   * GET /api/file
   * Query params: offset, limit
   */
  get = asyncHandler(async (req: Request, res: Response) => {
    const { offset = "0", limit = "10" } = req.query;
    const numericOffset = parseInt(offset as string, 10) || 0;
    const numericLimit = parseInt(limit as string, 10) || 10;

    const { files, total } = await FileService.get({}, {
      offset: numericOffset,
      limit: numericLimit,
    });

    res.status(200).json({
      success: true,
      data: files,
      meta: { total, offset: numericOffset, limit: numericLimit },
    });
  });

  /**
   * Get files uploaded by a specific user
   * GET /api/file/user/:userId
   */
  getByUser = asyncHandler(async (req: Request, res: Response) => {
    const { offset = "0", limit = "10" } = req.query;
    const numericOffset = parseInt(offset as string, 10) || 0;
    const numericLimit = parseInt(limit as string, 10) || 10;

    const { files, total } = await FileService.getByUploader(req.params.userId, {
      offset: numericOffset,
      limit: numericLimit,
    });

    res.status(200).json({
      success: true,
      data: files,
      meta: { total, offset: numericOffset, limit: numericLimit },
    });
  });

  /**
   * Get files associated with a specific model and document
   * GET /api/file/associated/:model/:documentId
   */
  getByAssociation = asyncHandler(async (req: Request, res: Response) => {
    const { model, documentId } = req.params;
    const { offset = "0", limit = "10" } = req.query;
    const numericOffset = parseInt(offset as string, 10) || 0;
    const numericLimit = parseInt(limit as string, 10) || 10;

    const { files, total } = await FileService.getByAssociation(model, documentId, {
      offset: numericOffset,
      limit: numericLimit,
    });

    res.status(200).json({
      success: true,
      data: files,
      meta: { total, offset: numericOffset, limit: numericLimit },
    });
  });

  /**
   * Delete a file
   * DELETE /api/file/:id
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const file = await FileService.delete(req.params.id);
    
    if (!file) {
      throw new CustomError("File not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  });

  /**
   * Delete multiple files
   * DELETE /api/file/bulk
   * Body: { ids: string[] }
   */
  deleteMultiple = asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new CustomError("No file IDs provided", 400);
    }

    const result = await FileService.deleteMany(ids);

    res.status(200).json({
      success: true,
      message: `${result.deleted} file(s) deleted successfully`,
      data: result,
    });
  });

  /**
   * Get transformed image URL
   * GET /api/file/:id/transform
   * Query params: width, height, crop, quality, format
   */
  getTransformedUrl = asyncHandler(async (req: Request, res: Response) => {
    const file = await FileService.getById(req.params.id);
    
    if (!file) {
      throw new CustomError("File not found", 404);
    }

    if (file.resourceType !== "image") {
      throw new CustomError("Transformations only available for images", 400);
    }

    const { width, height, crop, quality, format } = req.query;

    const transformedUrl = FileService.getTransformedImageUrl(file.publicId, {
      width: width ? parseInt(width as string, 10) : undefined,
      height: height ? parseInt(height as string, 10) : undefined,
      crop: crop as string,
      quality: quality as string,
      format: format as string,
    });

    res.status(200).json({
      success: true,
      data: {
        originalUrl: file.url,
        transformedUrl,
      },
    });
  });

  /**
   * Get signed URL for private file access
   * GET /api/file/:id/signed-url
   * Query params: expiresIn (seconds, default 3600)
   */
  getSignedUrl = asyncHandler(async (req: Request, res: Response) => {
    const file = await FileService.getById(req.params.id);
    
    if (!file) {
      throw new CustomError("File not found", 404);
    }

    const { expiresIn = "3600" } = req.query;
    const expiresInSeconds = parseInt(expiresIn as string, 10) || 3600;

    const signedUrl = FileService.generateSignedUrl(file.publicId, {
      expiresIn: expiresInSeconds,
    });

    res.status(200).json({
      success: true,
      data: {
        signedUrl,
        expiresIn: expiresInSeconds,
      },
    });
  });

  /**
   * Get my uploaded files
   * GET /api/file/my-files
   */
  getMyFiles = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    
    if (!userId) {
      throw new CustomError("User not authenticated", 401);
    }

    const { offset = "0", limit = "10" } = req.query;
    const numericOffset = parseInt(offset as string, 10) || 0;
    const numericLimit = parseInt(limit as string, 10) || 10;

    const { files, total } = await FileService.getByUploader(userId, {
      offset: numericOffset,
      limit: numericLimit,
    });

    res.status(200).json({
      success: true,
      data: files,
      meta: { total, offset: numericOffset, limit: numericLimit },
    });
  });
}

export default new FileController();
