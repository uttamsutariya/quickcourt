import { Request, Response } from "express";
import { User } from "../models";
import { WorkOSService } from "../services/workos.service";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/errors";
import { UserRole } from "../types/enums";

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			throw new UnauthorizedError("Not authenticated");
		}

		// Return user without sensitive fields
		const user = await User.findById(req.user._id).select("-__v");

		if (!user) {
			throw new NotFoundError("User not found");
		}

		res.json({
			success: true,
			user,
		});
	} catch (error: any) {
		console.error("Get current user error:", error);
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to get user",
		});
	}
};

/**
 * Create or update user after WorkOS authentication
 * This endpoint is called from frontend after successful WorkOS auth
 */
export const createOrUpdateUser = async (req: Request, res: Response) => {
	try {
		const { workosId, email, name, avatarUrl, role } = req.body;

		console.log("Create/Update user request - Role:", role, "Full body:", req.body);

		// Validate required fields
		if (!workosId || !email) {
			throw new BadRequestError("WorkOS ID and email are required");
		}

		// Validate role if provided
		const validRoles = [UserRole.USER, UserRole.FACILITY_OWNER];
		if (role && !validRoles.includes(role)) {
			throw new BadRequestError("Invalid role");
		}

		// Check if user exists
		let user = await User.findOne({ workosId });

		if (user) {
			// Update existing user - keep existing role unless explicitly changing
			user.email = email;
			user.name = name || user.name;
			user.avatarUrl = avatarUrl || user.avatarUrl;
			// Keep existing role, don't override
			await user.save();

			console.log("Updated existing user:", user.email, "with role:", user.role);
		} else {
			// Create new user with specified role
			const newUserRole = role || UserRole.USER;
			user = await User.create({
				workosId,
				email,
				name: name || email,
				avatarUrl,
				role: newUserRole,
				isActive: true,
			});

			console.log("Created new user:", user.email, "with role:", newUserRole);
		}

		res.json({
			success: true,
			user,
		});
	} catch (error: any) {
		console.error("Create/update user error:", error);
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to create/update user",
		});
	}
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			throw new UnauthorizedError("Not authenticated");
		}

		const { name, phoneNumber, avatarUrl } = req.body;

		// Update user profile
		const user = await User.findByIdAndUpdate(
			req.user._id,
			{
				...(name && { name }),
				...(phoneNumber && { phoneNumber }),
				...(avatarUrl && { avatarUrl }),
			},
			{ new: true, runValidators: true },
		).select("-__v");

		if (!user) {
			throw new NotFoundError("User not found");
		}

		res.json({
			success: true,
			user,
		});
	} catch (error: any) {
		console.error("Update profile error:", error);
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to update profile",
		});
	}
};

/**
 * Verify WorkOS token (for testing/debugging)
 */
export const verifyToken = async (req: Request, res: Response) => {
	try {
		const token = req.headers.authorization?.replace("Bearer ", "");

		if (!token) {
			throw new BadRequestError("No token provided");
		}

		const workosUser = await WorkOSService.verifyToken(token);

		res.json({
			success: true,
			workosUser,
		});
	} catch (error: any) {
		console.error("Verify token error:", error);
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Token verification failed",
		});
	}
};
