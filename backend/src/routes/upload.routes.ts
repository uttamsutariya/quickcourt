import { Router } from "express";
import * as uploadController from "../controllers/upload.controller";
import { authenticate } from "../middleware/auth.middleware";
import { uploadSingle, uploadMultiple } from "../middleware/upload.middleware";

const router = Router();

/**
 * @route   POST /api/upload/image
 * @desc    Upload single image to Cloudinary
 * @access  Private
 */
router.post("/image", authenticate, uploadSingle, uploadController.uploadImage);

/**
 * @route   POST /api/upload/images
 * @desc    Upload multiple images to Cloudinary
 * @access  Private
 */
router.post("/images", authenticate, uploadMultiple, uploadController.uploadImages);

/**
 * @route   DELETE /api/upload/image
 * @desc    Delete image from Cloudinary
 * @access  Private
 */
router.delete("/image", authenticate, uploadController.deleteImage);

export default router;
