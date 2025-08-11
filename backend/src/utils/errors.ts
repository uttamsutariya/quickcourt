/**
 * Custom error classes for application-specific error handling
 */

export class AppError extends Error {
	public statusCode: number;
	public isOperational: boolean;

	constructor(message: string, statusCode: number) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = true;

		Error.captureStackTrace(this, this.constructor);
	}
}

export class BadRequestError extends AppError {
	constructor(message: string = "Bad Request") {
		super(message, 400);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message: string = "Unauthorized") {
		super(message, 401);
	}
}

export class ForbiddenError extends AppError {
	constructor(message: string = "Forbidden") {
		super(message, 403);
	}
}

export class NotFoundError extends AppError {
	constructor(message: string = "Not Found") {
		super(message, 404);
	}
}

export class ConflictError extends AppError {
	constructor(message: string = "Conflict") {
		super(message, 409);
	}
}

export class ValidationError extends AppError {
	public errors?: any;

	constructor(message: string = "Validation Error", errors?: any) {
		super(message, 422);
		this.errors = errors;
	}
}

export class InternalServerError extends AppError {
	constructor(message: string = "Internal Server Error") {
		super(message, 500);
	}
}
