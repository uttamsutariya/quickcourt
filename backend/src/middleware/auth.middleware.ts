import { Request, Response, NextFunction } from "express";
import { WorkOSService, WorkOSUser } from "../services/workos.service";
import { User } from "../models";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { UserRole } from "../types/enums";

// Extend Express Request type to include user
export interface AuthenticatedRequest extends Request {
	user?: any; // MongoDB user document
	workosUser?: WorkOSUser; // WorkOS user data
}

declare global {
	namespace Express {
		interface Request {
			user?: any; // MongoDB user document
			workosUser?: WorkOSUser; // WorkOS user data
		}
	}
}

/**
 * Extract bearer token from Authorization header
 */
const extractToken = (authHeader?: string): string | null => {
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return null;
	}
	return authHeader.substring(7);
};

/**
 * Main authentication middleware
 * Verifies WorkOS token and loads user from database
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
	try {
		// Extract token from header
		const token = extractToken(req.headers.authorization);

		if (!token) {
			throw new UnauthorizedError("No authentication token provided");
		}

		// Verify token with WorkOS
		const workosUser = await WorkOSService.verifyToken(token);

		// Store WorkOS user data
		req.workosUser = workosUser;

		// Find or create user in our database
		let user = await User.findOne({ workosId: workosUser.sub });

		if (!user) {
			// Auto-create user if they don't exist (first sign-in after WorkOS auth)
			user = await User.create({
				workosId: workosUser.sub,
				email: workosUser.email,
				name: `${workosUser.firstName || ""} ${workosUser.lastName || ""}`.trim() || workosUser.email,
				avatarUrl: undefined, // WorkOS doesn't provide avatar in token
				role: UserRole.USER, // Default role, can be updated later
				isActive: true,
			});

			console.log("Auto-created new user:", user.email);
		} else if (!user.isActive) {
			throw new ForbiddenError("Account has been deactivated");
		}

		// Attach user to request
		req.user = user;

		next();
	} catch (error) {
		if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
			res.status(error.statusCode).json({
				success: false,
				message: error.message,
			});
		} else {
			console.error("Authentication error:", error);
			res.status(401).json({
				success: false,
				message: "Authentication failed",
			});
		}
	}
};

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if no token
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
	try {
		const token = extractToken(req.headers.authorization);

		if (!token) {
			// No token provided, continue without authentication
			return next();
		}

		// Try to verify token
		const workosUser = await WorkOSService.verifyToken(token);
		req.workosUser = workosUser;

		// Try to load user from database
		const user = await User.findOne({ workosId: workosUser.sub });
		if (user && user.isActive) {
			req.user = user;
		}

		next();
	} catch (error) {
		// Authentication failed, but continue anyway (optional)
		console.warn("Optional authentication failed:", error);
		next();
	}
};

/**
 * Role-based authorization middleware
 * Must be used after authenticate middleware
 */
export const authorize = (...allowedRoles: UserRole[]) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: "Authentication required",
			});
			return;
		}

		if (!allowedRoles.includes(req.user.role)) {
			res.status(403).json({
				success: false,
				message: "Insufficient permissions",
			});
			return;
		}

		next();
	};
};

// Export authenticate as authMiddleware for consistency with other files
export const authMiddleware = authenticate;

/**
 * Check if user owns the resource or is admin
 */
export const authorizeOwnerOrAdmin = (resourceOwnerId: string | ((req: Request) => string)) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		if (!req.user) {
			res.status(401).json({
				success: false,
				message: "Authentication required",
			});
			return;
		}

		// Admins can access everything
		if (req.user.role === UserRole.ADMIN) {
			next();
			return;
		}

		// Get the owner ID
		const ownerId = typeof resourceOwnerId === "function" ? resourceOwnerId(req) : resourceOwnerId;

		// Check if user owns the resource
		if (req.user._id.toString() === ownerId) {
			next();
			return;
		}

		res.status(403).json({
			success: false,
			message: "Access denied",
		});
	};
};
