import { Request, Response, NextFunction } from "express";
import { Venue } from "../models/Venue.model";
import { User } from "../models/User.model";
import { Court } from "../models/Court.model";
import { Booking } from "../models/Booking.model";
import { BadRequestError, NotFoundError } from "../utils/errors";
import { VenueStatus, UserRole } from "../types/enums";

// Get admin dashboard statistics
export const getAdminStats = async (_req: Request, res: Response, next: NextFunction) => {
	try {
		// Get all statistics in parallel for better performance
		const [
			totalVenues,
			pendingVenues,
			approvedVenues,
			rejectedVenues,
			totalUsers,
			totalFacilityOwners,
			totalBookings,
			totalActiveCourts,
			bookings,
		] = await Promise.all([
			// Venue statistics
			Venue.countDocuments(),
			Venue.countDocuments({ status: VenueStatus.PENDING }),
			Venue.countDocuments({ status: VenueStatus.APPROVED }),
			Venue.countDocuments({ status: VenueStatus.REJECTED }),

			// User statistics
			User.countDocuments({ role: UserRole.USER }),
			User.countDocuments({ role: UserRole.FACILITY_OWNER }),

			// Booking statistics
			Booking.countDocuments(),

			// Active courts count
			Court.countDocuments({ isActive: true }),

			// Get all bookings for earnings calculation
			Booking.find({ status: { $ne: "cancelled" } }).select("totalAmount createdAt"),
		]);

		// Calculate total earnings (10% commission)
		const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
		const adminEarnings = totalRevenue * 0.1; // 10% commission

		// Calculate this month's earnings
		const currentMonth = new Date();
		currentMonth.setDate(1);
		currentMonth.setHours(0, 0, 0, 0);

		const thisMonthBookings = await Booking.find({
			status: { $ne: "cancelled" },
			createdAt: { $gte: currentMonth },
		}).select("totalAmount");

		const thisMonthRevenue = thisMonthBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
		const thisMonthEarnings = thisMonthRevenue * 0.1;

		// Generate daily data for the last 30 days
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
		thirtyDaysAgo.setHours(0, 0, 0, 0);

		// Get bookings for the last 30 days
		const recentBookings = await Booking.find({
			status: { $ne: "cancelled" },
			createdAt: { $gte: thirtyDaysAgo },
		}).select("totalAmount createdAt");

		// Group bookings by day
		const dailyData: { [key: string]: { bookings: number; earnings: number } } = {};

		// Initialize all days with 0 values
		for (let i = 0; i < 30; i++) {
			const date = new Date();
			date.setDate(date.getDate() - i);
			const dateKey = date.toISOString().split("T")[0];
			dailyData[dateKey] = { bookings: 0, earnings: 0 };
		}

		// Fill in actual data
		recentBookings.forEach((booking) => {
			const dateKey = booking.createdAt.toISOString().split("T")[0];
			if (dailyData[dateKey]) {
				dailyData[dateKey].bookings += 1;
				dailyData[dateKey].earnings += (booking.totalAmount || 0) * 0.1; // 10% commission
			}
		});

		// Convert to arrays sorted by date (oldest first)
		const sortedDates = Object.keys(dailyData).sort();
		const dailyEarnings = sortedDates.map((date) => ({
			date,
			earnings: dailyData[date].earnings,
		}));

		const dailyBookings = sortedDates.map((date) => ({
			date,
			bookings: dailyData[date].bookings,
		}));

		res.status(200).json({
			success: true,
			stats: {
				venues: {
					total: totalVenues,
					pending: pendingVenues,
					approved: approvedVenues,
					rejected: rejectedVenues,
				},
				users: {
					totalUsers,
					totalFacilityOwners,
				},
				bookings: {
					total: totalBookings,
				},
				courts: {
					totalActive: totalActiveCourts,
				},
				earnings: {
					totalRevenue,
					adminEarnings,
					thisMonthRevenue,
					thisMonthEarnings,
				},
				charts: {
					dailyEarnings,
					dailyBookings,
				},
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
		const { role, status, search, page = 1, limit = 20 } = req.query;

		const query: any = {};

		// Role filter
		if (role && role !== "all") {
			query.role = role;
		}

		// Status filter (active/inactive)
		if (status && status !== "all") {
			query.isActive = status === "active";
		}

		// Search by name or email
		if (search) {
			const searchRegex = new RegExp(search as string, "i");
			query.$or = [{ name: searchRegex }, { email: searchRegex }];
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

// Get user booking history (admin only)
export const getUserBookingHistory = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { id } = req.params;

		// Verify user exists
		const user = await User.findById(id);
		if (!user) {
			throw new NotFoundError("User not found");
		}

		// Get all bookings for the user with populated venue and court details
		const bookings = await Booking.find({ userId: id })
			.populate("venueId", "name address")
			.populate("courtId", "name sportType")
			.sort({
				// Sort by status priority: confirmed (upcoming) first, then completed, then cancelled
				status: 1,
				bookingDate: -1,
				startTime: -1,
			});

		// Custom sort to ensure proper ordering: upcoming -> completed -> cancelled
		const sortedBookings = bookings.sort((a, b) => {
			const statusPriority = {
				confirmed: 1,
				completed: 2,
				cancelled: 3,
			};

			const aPriority = statusPriority[a.status as keyof typeof statusPriority] || 4;
			const bPriority = statusPriority[b.status as keyof typeof statusPriority] || 4;

			if (aPriority !== bPriority) {
				return aPriority - bPriority;
			}

			// If same status, sort by date (newest first)
			return new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime();
		});

		res.status(200).json({
			success: true,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
			bookings: sortedBookings,
		});
	} catch (error) {
		next(error);
	}
};
