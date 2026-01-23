import { Router } from "express";
import FileController from "./file.controller";
import { upload, uploadImage } from "../../middleware/upload";
import jwtAuth from "../../middleware/jwtAuth";

const router = Router();

// Apply JWT authentication to all routes
router.use(jwtAuth);

// Upload single file (accepts both images and documents)
router.post("/upload", upload.single("file"), FileController.uploadSingle);

// Upload multiple files (max 10)
router.post("/upload-multiple", upload.array("files", 10), FileController.uploadMultiple);

// Upload single image only
router.post("/upload-image", uploadImage.single("image"), FileController.uploadSingle);

// Upload multiple images only (max 10)
router.post("/upload-images", uploadImage.array("images", 10), FileController.uploadMultiple);

// Get my uploaded files
router.get("/my-files", FileController.getMyFiles);

// Get all files (with pagination)
router.get("/", FileController.get);

// Get files by user
router.get("/user/:userId", FileController.getByUser);

// Get files by association (e.g., files for a specific restaurant)
router.get("/associated/:model/:documentId", FileController.getByAssociation);

// Get transformed image URL
router.get("/:id/transform", FileController.getTransformedUrl);

// Get signed URL for private files
router.get("/:id/signed-url", FileController.getSignedUrl);

// Get file by ID
router.get("/:id", FileController.getById);

// Delete multiple files
router.delete("/bulk", FileController.deleteMultiple);

// Delete file by ID
router.delete("/:id", FileController.delete);

export default router;
