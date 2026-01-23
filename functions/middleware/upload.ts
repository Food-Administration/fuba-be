import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Request } from "express";
import cloudinary from "../config/cloudinary";

// Allowed image MIME types
const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

// Allowed document MIME types
const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// All allowed MIME types
const ALL_ALLOWED_TYPES = [...IMAGE_MIME_TYPES, ...DOCUMENT_MIME_TYPES];

/**
 * Determine the Cloudinary folder based on upload context
 */
const getFolderFromRequest = (req: Request): string => {
  // Check for custom folder in request body or query
  if (req.body?.folder) return req.body.folder;
  if (req.query?.folder) return req.query.folder as string;
  
  // Default folders based on route patterns
  const path = req.originalUrl || req.path;
  
  if (path.includes("/restaurant")) return "restaurants";
  if (path.includes("/food-item")) return "food-items";
  if (path.includes("/user") || path.includes("/profile")) return "profiles";
  
  return "uploads"; // Default folder
};

/**
 * Cloudinary storage configuration
 * Automatically organizes files into folders based on type and context
 */
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const isImage = IMAGE_MIME_TYPES.includes(file.mimetype);
    const folder = getFolderFromRequest(req);
    
    // Generate a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const originalName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
    const publicId = `${originalName}-${uniqueSuffix}`;

    return {
      folder: isImage ? `${folder}/images` : `${folder}/documents`,
      resource_type: isImage ? "image" : "raw",
      public_id: publicId,
      // Apply automatic format and quality optimization for images
      ...(isImage && {
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      }),
    };
  },
});

/**
 * File filter to validate uploaded files
 */
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (ALL_ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Allowed types: images (jpeg, png, gif, webp, svg) and documents (pdf, doc, docx, xls, xlsx)`
      )
    );
  }
};

/**
 * Image-only file filter
 */
const imageOnlyFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only images (jpeg, png, gif, webp, svg) are allowed.`
      )
    );
  }
};

/**
 * Document-only file filter
 */
const documentOnlyFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (DOCUMENT_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only documents (pdf, doc, docx, xls, xlsx) are allowed.`
      )
    );
  }
};

/**
 * Main upload middleware with Cloudinary storage
 * Accepts both images and documents
 * Max file size: 10MB
 */
export const upload = multer({
  storage: cloudinaryStorage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * Image-only upload middleware
 * Max file size: 5MB
 */
export const uploadImage = multer({
  storage: cloudinaryStorage,
  fileFilter: imageOnlyFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

/**
 * Document-only upload middleware
 * Max file size: 10MB
 */
export const uploadDocument = multer({
  storage: cloudinaryStorage,
  fileFilter: documentOnlyFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * Memory storage for cases where you need to process the file before uploading
 * Useful for image resizing, watermarking, etc.
 */
export const uploadMemory = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

export default upload;
