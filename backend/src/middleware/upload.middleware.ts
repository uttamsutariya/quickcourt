import multer from "multer";
import { Request } from "express";
import { BadRequestError } from "../utils/errors";

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
	// Accept images only
	if (file.mimetype.startsWith("image/")) {
		cb(null, true);
	} else {
		cb(new BadRequestError("Only image files are allowed"));
	}
};

// Create multer upload middleware
export const upload = multer({
	storage,
	fileFilter,
	limits: {
		fileSize: 5 * 1024 * 1024, // 5MB max file size
		files: 10, // Maximum 10 files at once
	},
});

// Single image upload
export const uploadSingle = upload.single("image");

// Multiple images upload (max 10)
export const uploadMultiple = upload.array("images", 10);
