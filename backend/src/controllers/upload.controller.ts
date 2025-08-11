import { Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import { BadRequestError } from "../utils/errors";

/**
 * Upload single image to Cloudinary
 */
export const uploadImage = async (req: Request, res: Response) => {
	try {
		if (!req.file) {
			throw new BadRequestError("No image file provided");
		}

		// Convert buffer to base64
		const b64 = Buffer.from(req.file.buffer).toString("base64");
		const dataURI = `data:${req.file.mimetype};base64,${b64}`;

		// Upload to Cloudinary
		const result = await cloudinary.uploader.upload(dataURI, {
			folder: "quickcourt/venues",
			resource_type: "auto",
			transformation: [
				{ width: 1200, height: 800, crop: "limit" }, // Limit max dimensions
				{ quality: "auto:good" }, // Optimize quality
			],
		});

		res.json({
			success: true,
			url: result.secure_url,
			publicId: result.public_id,
		});
	} catch (error: any) {
		console.error("Image upload error:", error);
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to upload image",
		});
	}
};

/**
 * Upload multiple images to Cloudinary
 */
export const uploadImages = async (req: Request, res: Response) => {
	try {
		if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
			throw new BadRequestError("No image files provided");
		}

		const uploadPromises = req.files.map(async (file) => {
			// Convert buffer to base64
			const b64 = Buffer.from(file.buffer).toString("base64");
			const dataURI = `data:${file.mimetype};base64,${b64}`;

			// Upload to Cloudinary
			return cloudinary.uploader.upload(dataURI, {
				folder: "quickcourt/venues",
				resource_type: "auto",
				transformation: [{ width: 1200, height: 800, crop: "limit" }, { quality: "auto:good" }],
			});
		});

		const results = await Promise.all(uploadPromises);
		const urls = results.map((result) => ({
			url: result.secure_url,
			publicId: result.public_id,
		}));

		res.json({
			success: true,
			images: urls,
		});
	} catch (error: any) {
		console.error("Images upload error:", error);
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to upload images",
		});
	}
};

/**
 * Delete image from Cloudinary
 */
export const deleteImage = async (req: Request, res: Response) => {
	try {
		const { publicId } = req.body;

		if (!publicId) {
			throw new BadRequestError("Public ID is required");
		}

		await cloudinary.uploader.destroy(publicId);

		res.json({
			success: true,
			message: "Image deleted successfully",
		});
	} catch (error: any) {
		console.error("Image delete error:", error);
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to delete image",
		});
	}
};
