import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

/**
 * Global error handling middleware
 */
export const errorHandler = (err: Error | AppError, _req: Request, res: Response, _next: NextFunction) => {
	// Default to 500 server error
	let statusCode = 500;
	let message = "Internal Server Error";
	let errors = undefined;

	// Check if it's an operational error
	if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;

		// Include validation errors if present
		if ("errors" in err) {
			errors = (err as any).errors;
		}
	} else if (err.name === "ValidationError") {
		// Mongoose validation error
		statusCode = 422;
		message = "Validation Error";
		errors = Object.values((err as any).errors).map((e: any) => ({
			field: e.path,
			message: e.message,
		}));
	} else if (err.name === "CastError") {
		// Mongoose cast error (invalid ObjectId, etc.)
		statusCode = 400;
		message = "Invalid data format";
	} else if (err.name === "MongoServerError" && (err as any).code === 11000) {
		// MongoDB duplicate key error
		statusCode = 409;
		const field = Object.keys((err as any).keyPattern)[0];
		message = `${field} already exists`;
	}

	// Log error for debugging (only in development)
	if (process.env.NODE_ENV === "development") {
		console.error("Error:", {
			message: err.message,
			stack: err.stack,
			statusCode,
		});
	} else {
		// In production, log only error message
		console.error(`Error: ${err.message}`);
	}

	// Send error response
	res.status(statusCode).json({
		success: false,
		message,
		...(errors && { errors }),
		...(process.env.NODE_ENV === "development" && { stack: err.stack }),
	});
};

/**
 * Catch async errors and pass them to error handler
 */
export const asyncHandler = (fn: Function) => {
	return (req: Request, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};
