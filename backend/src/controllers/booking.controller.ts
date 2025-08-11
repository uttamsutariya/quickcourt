import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { Booking } from "../models/Booking.model";
import { Court } from "../models/Court.model";
import { Venue } from "../models/Venue.model";
import { AdminSettings } from "../models/AdminSettings.model";
import { AppError } from "../utils/errors";
import { BookingStatus } from "../types/enums";
import { validateBookingTime } from "../utils/slotHelpers";

// Create a new booking
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
	const session = await mongoose.startSession();
	session.startTransaction();

	try {
		const { courtId, bookingDate, startTime, endTime, numberOfSlots } = req.body;

		// Validate user role
		if (req.user.role !== "user") {
			throw new AppError("Only users can create bookings", 403);
		}

		// Validate court exists and is active
		const court = await Court.findById(courtId);
		if (!court || !court.isActive) {
			throw new AppError("Court not found or not available", 404);
		}

		// Get venue
		const venue = await Venue.findById(court.venueId);
		if (!venue || !venue.isActive || venue.status !== "approved") {
			throw new AppError("Venue not available for booking", 400);
		}

		// Validate number of slots (max 4)
		if (numberOfSlots < 1 || numberOfSlots > 4) {
			throw new AppError("You can book between 1 and 4 consecutive slots", 400);
		}

		// Get admin settings for booking restrictions
		const settings = await AdminSettings.getSettings();

		// Validate booking date is within allowed advance period
		const bookingDateObj = new Date(bookingDate);
		if (!settings.isBookingDateAllowed(bookingDateObj)) {
			throw new AppError(`Bookings can only be made up to ${settings.maxBookingAdvanceDays} days in advance`, 400);
		}

		// Validate booking time
		const validation = await validateBookingTime(courtId, bookingDateObj, startTime, endTime, numberOfSlots);

		if (!validation.isValid) {
			throw new AppError(validation.message || "Invalid booking time", 400);
		}

		// Check if slot is available (with database lock)
		const isAvailable = await Booking.isSlotAvailable(courtId, bookingDateObj, startTime, endTime);

		if (!isAvailable) {
			throw new AppError("Selected time slot is not available", 400);
		}

		// Calculate total amount
		const dayOfWeek = bookingDateObj.getDay();
		const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
		const slotConfig = court.slotConfigurations.find((config) => config.dayOfWeek === dayNames[dayOfWeek]);

		if (!slotConfig || !slotConfig.isOpen) {
			throw new AppError("Court is closed on this day", 400);
		}

		const totalAmount = (slotConfig.price || 0) * numberOfSlots;

		// Create booking
		const booking = await Booking.create(
			[
				{
					userId: req.user._id,
					venueId: venue._id,
					courtId: court._id,
					bookingDate: bookingDateObj,
					startTime,
					endTime,
					numberOfSlots,
					slotDuration: slotConfig.slotDuration,
					totalAmount,
					status: BookingStatus.CONFIRMED,
					paymentSimulated: true,
				},
			],
			{ session },
		);

		await session.commitTransaction();

		// Populate booking details for response
		const populatedBooking = await Booking.findById(booking[0]._id)
			.populate("venueId", "name address")
			.populate("courtId", "name sportType")
			.populate("userId", "name email");

		res.status(201).json({
			success: true,
			message: "Booking created successfully",
			booking: populatedBooking,
		});
	} catch (error) {
		await session.abortTransaction();
		next(error);
	} finally {
		session.endSession();
	}
};

// Get user's bookings
export const getUserBookings = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { status, upcoming, past } = req.query;

		let bookings;

		if (upcoming === "true") {
			bookings = await Booking.findUpcomingByUser(req.user._id);
			// Populate after finding
			bookings = await Booking.populate(bookings, [
				{ path: "venueId", select: "name address images" },
				{ path: "courtId", select: "name sportType" },
			]);
		} else if (past === "true") {
			bookings = await Booking.findPastByUser(req.user._id);
			// Populate after finding
			bookings = await Booking.populate(bookings, [
				{ path: "venueId", select: "name address images" },
				{ path: "courtId", select: "name sportType" },
			]);
		} else {
			// Get all bookings
			const query: any = { userId: req.user._id };
			if (status) {
				query.status = status;
			}

			bookings = await Booking.find(query)
				.sort({ bookingDate: -1, startTime: -1 })
				.populate("venueId", "name address images")
				.populate("courtId", "name sportType");
		}

		res.status(200).json({
			success: true,
			bookings,
		});
	} catch (error) {
		next(error);
	}
};

// Get venue bookings (for facility owners)
export const getVenueBookings = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { venueId } = req.params;
		const { courtId, date, status } = req.query;

		// Verify venue and ownership
		const venue = await Venue.findById(venueId);
		if (!venue || !venue.isActive) {
			throw new AppError("Venue not found", 404);
		}

		const isOwner = venue.ownerId.toString() === req.user._id.toString();
		const isAdmin = req.user.role === "admin";

		if (!isOwner && !isAdmin) {
			throw new AppError("You do not have permission to view these bookings", 403);
		}

		// Build query
		const query: any = { venueId };

		if (courtId) {
			query.courtId = courtId;
		}

		if (date) {
			const bookingDate = new Date(date as string);
			query.bookingDate = {
				$gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
				$lt: new Date(bookingDate.setHours(23, 59, 59, 999)),
			};
		}

		if (status) {
			query.status = status;
		}

		const bookings = await Booking.find(query)
			.sort({ bookingDate: 1, startTime: 1 })
			.populate("userId", "name email")
			.populate("courtId", "name sportType");

		res.status(200).json({
			success: true,
			bookings,
		});
	} catch (error) {
		next(error);
	}
};

// Get all bookings for owner's venues
export const getOwnerBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { status, timeFilter, venueId } = req.query;

		// Check if user is facility owner
		if (req.user.role !== "facility_owner") {
			throw new AppError("Only facility owners can access this endpoint", 403);
		}

		// Get all venues owned by this user
		const ownerVenues = await Venue.find({
			ownerId: req.user._id,
			isActive: true,
		}).select("_id name");

		if (!ownerVenues || ownerVenues.length === 0) {
			res.status(200).json({
				success: true,
				bookings: [],
				venues: [],
			});
			return;
		}

		// Build query
		const venueIds = ownerVenues.map((v) => v._id);
		const query: any = {};

		// Filter by specific venue or all owner's venues
		if (venueId && venueIds.some((id: any) => id.toString() === venueId)) {
			query.venueId = venueId;
		} else {
			query.venueId = { $in: venueIds };
		}

		// Status filter
		if (status && status !== "all") {
			query.status = status;
		}

		// Time filter (upcoming, past, today)
		const now = new Date();
		const today = new Date(now.setHours(0, 0, 0, 0));
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		if (timeFilter === "upcoming") {
			query.bookingDate = { $gte: tomorrow };
			query.status = BookingStatus.CONFIRMED;
		} else if (timeFilter === "past") {
			query.bookingDate = { $lt: today };
		} else if (timeFilter === "today") {
			query.bookingDate = {
				$gte: today,
				$lt: tomorrow,
			};
		}

		// Fetch bookings with populated data
		const bookings = await Booking.find(query)
			.sort({ bookingDate: -1, startTime: -1 })
			.populate("userId", "name email phoneNumber")
			.populate("courtId", "name sportType")
			.populate("venueId", "name address");

		res.status(200).json({
			success: true,
			bookings,
			venues: ownerVenues,
		});
	} catch (error) {
		next(error);
	}
};

// Get booking details
export const getBookingDetails = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { bookingId } = req.params;

		const booking = await Booking.findById(bookingId)
			.populate("venueId", "name address amenities images")
			.populate("courtId", "name sportType description")
			.populate("userId", "name email");

		if (!booking) {
			throw new AppError("Booking not found", 404);
		}

		// Check if user has permission to view this booking
		const isOwner = booking.userId._id.toString() === req.user._id.toString();
		const isVenueOwner =
			req.user.role === "facility_owner" && (await Venue.exists({ _id: booking.venueId, ownerId: req.user._id }));
		const isAdmin = req.user.role === "admin";

		if (!isOwner && !isVenueOwner && !isAdmin) {
			throw new AppError("You do not have permission to view this booking", 403);
		}

		res.status(200).json({
			success: true,
			booking,
		});
	} catch (error) {
		next(error);
	}
};

// Cancel booking
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { bookingId } = req.params;
		const { reason } = req.body;

		const booking = await Booking.findById(bookingId);
		if (!booking) {
			throw new AppError("Booking not found", 404);
		}

		// Check if user owns this booking
		if (booking.userId.toString() !== req.user._id.toString()) {
			throw new AppError("You can only cancel your own bookings", 403);
		}

		// Check if booking can be cancelled
		if (!booking.canBeCancelled()) {
			const settings = await AdminSettings.getSettings();
			throw new AppError(
				`Bookings must be cancelled at least ${settings.cancellationMinHours} hours before the start time`,
				400,
			);
		}

		// Cancel booking
		await booking.cancel(reason);

		res.status(200).json({
			success: true,
			message: "Booking cancelled successfully",
		});
	} catch (error) {
		next(error);
	}
};
