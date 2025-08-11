import { Request, Response, NextFunction } from "express";
import { Venue } from "../models/Venue.model";
import { User } from "../models/User.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { VenueStatus, UserRole } from "../types/enums";

// Get admin dashboard statistics
export const getAdminStats = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		// Get venue statistics
		const [totalVenues, pendingVenues, approvedVenues, rejectedVenues] = await Promise.all([
			Venue.countDocuments(),
			Venue.countDocuments({ status: VenueStatus.PENDING }),
			Venue.countDocuments({ status: VenueStatus.APPROVED }),
			Venue.countDocuments({ status: VenueStatus.REJECTED }),
		]);

		res.status(200).json({
			success: true,
			stats: {
				totalVenues,
				pendingVenues,
				approvedVenues,
				rejectedVenues,
			},
		});
	} catch (error) {
		next(error);
	}
};

// Get all venues with filters for admin
export const getAdminVenues = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { status, page = 1, limit = 10 } = req.query;

		const query: any = {};
		if (status) {
			query.status = status;
		}

		const venues = await Venue.find(query)
			.populate("ownerId", "name email phoneNumber")
			.sort({ createdAt: -1 })
			.limit(Number(limit))
			.skip((Number(page) - 1) * Number(limit));

		const total = await Venue.countDocuments(query);

		// Transform venues to include owner info
		const transformedVenues = venues.map((venue) => {
			const venueObj = venue.toObject();
			const owner = venueObj.ownerId as any;
			return {
				...venueObj,
				ownerName: owner?.name,
				ownerEmail: owner?.email,
				ownerPhone: owner?.phoneNumber,
			};
		});

		res.status(200).json({
			success: true,
			venues: transformedVenues,
			pagination: {
				total,
				page: Number(page),
				limit: Number(limit),
				pages: Math.ceil(total / Number(limit)),
			},
		});
	} catch (error) {
		next(error);
	}
};

// Get single venue details for admin
export const getAdminVenueById = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;

		const venue = await Venue.findById(id).populate("ownerId", "name email phoneNumber");

		if (!venue) {
			throw new NotFoundError("Venue not found");
		}

		// Transform venue to include owner info
		const venueObj = venue.toObject();
		const owner = venueObj.ownerId as any;
		const transformedVenue = {
			...venueObj,
			owner: owner
				? {
						_id: owner._id,
						name: owner.name,
						email: owner.email,
						phoneNumber: owner.phoneNumber,
				  }
				: null,
		};

		res.status(200).json({
			success: true,
			venue: transformedVenue,
		});
	} catch (error) {
		next(error);
	}
};

// Approve a venue
export const approveVenue = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;

		const venue = await Venue.findById(id);

		if (!venue) {
			throw new NotFoundError("Venue not found");
		}

		if (venue.status !== VenueStatus.PENDING) {
			throw new BadRequestError("Only pending venues can be approved");
		}

		venue.status = VenueStatus.APPROVED;
		venue.rejectionReason = undefined; // Clear any previous rejection reason
		await venue.save();

		res.status(200).json({
			success: true,
			message: "Venue approved successfully",
			venue,
		});
	} catch (error) {
		next(error);
	}
};

// Reject a venue
export const rejectVenue = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;
		const { reason } = req.body;

		if (!reason || !reason.trim()) {
			throw new BadRequestError("Rejection reason is required");
		}

		const venue = await Venue.findById(id);

		if (!venue) {
			throw new NotFoundError("Venue not found");
		}

		if (venue.status !== VenueStatus.PENDING) {
			throw new BadRequestError("Only pending venues can be rejected");
		}

		venue.status = VenueStatus.REJECTED;
		venue.rejectionReason = reason;
		await venue.save();

		// TODO: Send notification to owner about rejection with reason

		res.status(200).json({
			success: true,
			message: "Venue rejected successfully",
			venue,
		});
	} catch (error) {
		next(error);
	}
};

// Get all users (admin only)
export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { role, page = 1, limit = 10 } = req.query;

		const query: any = {};
		if (role) {
			query.role = role;
		}

		const users = await User.find(query)
			.select("-workosId")
			.sort({ createdAt: -1 })
			.limit(Number(limit))
			.skip((Number(page) - 1) * Number(limit));

		const total = await User.countDocuments(query);

		res.status(200).json({
			success: true,
			users,
			pagination: {
				total,
				page: Number(page),
				limit: Number(limit),
				pages: Math.ceil(total / Number(limit)),
			},
		});
	} catch (error) {
		next(error);
	}
};

// Toggle user active status
export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;

		const user = await User.findById(id);

		if (!user) {
			throw new NotFoundError("User not found");
		}

		if (user.role === UserRole.ADMIN) {
			throw new BadRequestError("Cannot modify admin user status");
		}

		user.isActive = !user.isActive;
		await user.save();

		res.status(200).json({
			success: true,
			message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
			user,
		});
	} catch (error) {
		next(error);
	}
};
