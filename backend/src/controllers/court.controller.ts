import { Request, Response, NextFunction } from "express";
import { Court } from "../models/Court.model";
import { Venue } from "../models/Venue.model";
import { CourtUnavailability } from "../models/CourtUnavailability.model";
import { AppError } from "../utils/errors";
import { SportType, DayOfWeek, SlotDuration, UnavailabilityReason } from "../types/enums";
import { generateAvailableSlots } from "../utils/slotHelpers";
import mongoose from "mongoose";

// Get all courts for a venue
export const getCourtsByVenue = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { venueId } = req.params;

		// Verify venue exists
		const venue = await Venue.findById(venueId);
		if (!venue || !venue.isActive) {
			throw new AppError("Venue not found", 404);
		}

		// Check if user is owner or admin
		const isOwner = venue.ownerId.toString() === req.user._id.toString();
		const isAdmin = req.user.role === "admin";
		const isEndUser = req.user.role === "user";

		// For approved venues, allow public/user access to view courts (for booking)
		// For pending/rejected venues, only owner/admin can view
		if (venue.status !== "approved" && !isOwner && !isAdmin) {
			throw new AppError("You do not have permission to view courts for this venue", 403);
		}

		// If it's an end user viewing an approved venue, only show active courts
		// Owners and admins can see all courts (including inactive)
		let courts;
		if (isEndUser && venue.status === "approved") {
			courts = await Court.find({
				venueId: new mongoose.Types.ObjectId(venueId),
				isActive: true,
			});
		} else {
			courts = await Court.findByVenue(new mongoose.Types.ObjectId(venueId));
		}

		res.status(200).json({
			success: true,
			courts,
		});
	} catch (error) {
		next(error);
	}
};

// Create a new court
export const createCourt = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { venueId } = req.params;
		const { name, sportType, description, defaultPrice, slotConfigurations } = req.body;

		// Validate venue and ownership
		const venue = await Venue.findById(venueId);
		if (!venue || !venue.isActive) {
			throw new AppError("Venue not found", 404);
		}

		const isOwner = venue.ownerId.toString() === req.user._id.toString();
		const isAdmin = req.user.role === "admin";

		if (!isOwner && !isAdmin) {
			throw new AppError("You do not have permission to manage this venue", 403);
		}

		// Validate court name length
		if (!name || name.length < 2 || name.length > 20) {
			throw new AppError("Court name must be between 2 and 20 characters", 400);
		}

		// Validate sport type
		if (!Object.values(SportType).includes(sportType)) {
			throw new AppError("Invalid sport type", 400);
		}

		// Check if sport type is available in venue
		if (!venue.sports.includes(sportType)) {
			throw new AppError("This sport type is not available in the venue", 400);
		}

		// Create court with default or provided configurations
		const courtData: any = {
			venueId,
			name,
			sportType,
			description,
			defaultPrice: defaultPrice || 500,
		};

		// If no slot configurations provided, create default ones
		if (!slotConfigurations || slotConfigurations.length === 0) {
			courtData.slotConfigurations = createDefaultSlotConfigurations(defaultPrice || 500);
		} else {
			// Validate provided configurations
			validateSlotConfigurations(slotConfigurations);
			courtData.slotConfigurations = slotConfigurations;
		}

		const court = await Court.create(courtData);

		res.status(201).json({
			success: true,
			message: "Court created successfully",
			court,
		});
	} catch (error) {
		next(error);
	}
};

// Get court details
export const getCourtDetails = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { venueId, courtId } = req.params;

		const court = await Court.findById(courtId);
		if (!court || !court.isActive || court.venueId.toString() !== venueId) {
			throw new AppError("Court not found", 404);
		}

		res.status(200).json({
			success: true,
			court,
		});
	} catch (error) {
		next(error);
	}
};

// Update court
export const updateCourt = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { venueId, courtId } = req.params;
		const updates = req.body;

		// Verify venue and ownership
		const venue = await Venue.findById(venueId);
		if (!venue || !venue.isActive) {
			throw new AppError("Venue not found", 404);
		}

		const isOwner = venue.ownerId.toString() === req.user._id.toString();
		const isAdmin = req.user.role === "admin";

		if (!isOwner && !isAdmin) {
			throw new AppError("You do not have permission to manage this venue", 403);
		}

		// Find court
		const court = await Court.findById(courtId);
		if (!court || !court.isActive || court.venueId.toString() !== venueId) {
			throw new AppError("Court not found", 404);
		}

		// Validate updates
		if (updates.name) {
			if (updates.name.length < 2 || updates.name.length > 20) {
				throw new AppError("Court name must be between 2 and 20 characters", 400);
			}
		}

		if (updates.sportType) {
			if (!Object.values(SportType).includes(updates.sportType)) {
				throw new AppError("Invalid sport type", 400);
			}
			if (!venue.sports.includes(updates.sportType)) {
				throw new AppError("This sport type is not available in the venue", 400);
			}
		}

		if (updates.slotConfigurations) {
			validateSlotConfigurations(updates.slotConfigurations);
		}

		// Apply updates
		Object.assign(court, updates);
		await court.save();

		res.status(200).json({
			success: true,
			message: "Court updated successfully",
			court,
		});
	} catch (error) {
		next(error);
	}
};

// Delete court (soft delete)
export const deleteCourt = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { venueId, courtId } = req.params;

		// Verify venue and ownership
		const venue = await Venue.findById(venueId);
		if (!venue || !venue.isActive) {
			throw new AppError("Venue not found", 404);
		}

		const isOwner = venue.ownerId.toString() === req.user._id.toString();
		const isAdmin = req.user.role === "admin";

		if (!isOwner && !isAdmin) {
			throw new AppError("You do not have permission to manage this venue", 403);
		}

		// Find court
		const court = await Court.findById(courtId);
		if (!court || court.venueId.toString() !== venueId) {
			throw new AppError("Court not found", 404);
		}

		// Soft delete
		court.isActive = false;
		await court.save();

		res.status(200).json({
			success: true,
			message: "Court deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};

// Get court availability
export const getCourtAvailability = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { courtId } = req.params;
		const { startDate, days = 3 } = req.query;

		const court = await Court.findById(courtId);
		if (!court || !court.isActive) {
			throw new AppError("Court not found", 404);
		}

		// Generate availability for the requested period
		const availabilityMap: any = {};
		const baseDate = startDate ? new Date(startDate as string) : new Date();
		const numDays = Math.min(Number(days), 7); // Max 7 days

		for (let i = 0; i < numDays; i++) {
			const date = new Date(baseDate);
			date.setDate(date.getDate() + i);

			const dateStr = date.toISOString().split("T")[0];
			const slots = await generateAvailableSlots(new mongoose.Types.ObjectId(courtId), date);
			availabilityMap[dateStr] = slots;
		}

		res.status(200).json({
			success: true,
			courtId,
			availability: availabilityMap,
		});
	} catch (error) {
		next(error);
	}
};

// Mark court as unavailable
export const markCourtUnavailable = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { venueId, courtId } = req.params;
		const { startDateTime, endDateTime, reason, description, isRecurring, recurringDays } = req.body;

		// Verify venue and ownership
		const venue = await Venue.findById(venueId);
		if (!venue || !venue.isActive) {
			throw new AppError("Venue not found", 404);
		}

		const isOwner = venue.ownerId.toString() === req.user._id.toString();
		const isAdmin = req.user.role === "admin";

		if (!isOwner && !isAdmin) {
			throw new AppError("You do not have permission to manage this venue", 403);
		}

		// Verify court exists
		const court = await Court.findById(courtId);
		if (!court || !court.isActive || court.venueId.toString() !== venueId) {
			throw new AppError("Court not found", 404);
		}

		// Validate dates
		const start = new Date(startDateTime);
		const end = new Date(endDateTime);

		if (start >= end) {
			throw new AppError("End time must be after start time", 400);
		}

		// Create unavailability
		const unavailability = await CourtUnavailability.create({
			courtId,
			venueId,
			startDateTime: start,
			endDateTime: end,
			reason: reason || UnavailabilityReason.MAINTENANCE,
			description,
			createdBy: req.user._id,
			isRecurring: isRecurring || false,
			recurringDays: isRecurring ? recurringDays : [],
		});

		res.status(201).json({
			success: true,
			message: "Court marked as unavailable",
			unavailability,
		});
	} catch (error) {
		next(error);
	}
};

// Remove court unavailability
export const removeCourtUnavailability = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { venueId, courtId, unavailabilityId } = req.params;

		// Verify venue and ownership
		const venue = await Venue.findById(venueId);
		if (!venue || !venue.isActive) {
			throw new AppError("Venue not found", 404);
		}

		const isOwner = venue.ownerId.toString() === req.user._id.toString();
		const isAdmin = req.user.role === "admin";

		if (!isOwner && !isAdmin) {
			throw new AppError("You do not have permission to manage this venue", 403);
		}

		// Find and delete unavailability
		const unavailability = await CourtUnavailability.findById(unavailabilityId);
		if (!unavailability || unavailability.courtId.toString() !== courtId) {
			throw new AppError("Unavailability record not found", 404);
		}

		await unavailability.deleteOne();

		res.status(200).json({
			success: true,
			message: "Court unavailability removed successfully",
		});
	} catch (error) {
		next(error);
	}
};

// Helper function to create default slot configurations
function createDefaultSlotConfigurations(defaultPrice: number) {
	const days = [
		DayOfWeek.MONDAY,
		DayOfWeek.TUESDAY,
		DayOfWeek.WEDNESDAY,
		DayOfWeek.THURSDAY,
		DayOfWeek.FRIDAY,
		DayOfWeek.SATURDAY,
		DayOfWeek.SUNDAY,
	];

	return days.map((day) => ({
		dayOfWeek: day,
		isOpen: true,
		startTime: "10:00",
		slotDuration: SlotDuration.ONE_HOUR,
		numberOfSlots: 11, // 10 AM to 9 PM = 11 hours
		price: defaultPrice,
	}));
}

// Helper function to validate slot configurations
function validateSlotConfigurations(configurations: any[]) {
	if (!configurations || configurations.length !== 7) {
		throw new AppError("Must provide configurations for all 7 days", 400);
	}

	const days = new Set();

	for (const config of configurations) {
		// Check for duplicate days
		if (days.has(config.dayOfWeek)) {
			throw new AppError("Duplicate day configuration found", 400);
		}
		days.add(config.dayOfWeek);

		// Validate day
		if (!Object.values(DayOfWeek).includes(config.dayOfWeek)) {
			throw new AppError("Invalid day of week", 400);
		}

		// Validate slot duration
		if (!Object.values(SlotDuration).includes(config.slotDuration)) {
			throw new AppError("Invalid slot duration", 400);
		}

		// Validate time constraints
		if (config.isOpen) {
			const [hours] = config.startTime.split(":").map(Number);
			const totalHours = config.slotDuration * config.numberOfSlots;
			const endHour = hours + totalHours;

			if (endHour > 24) {
				throw new AppError(`Invalid configuration for ${config.dayOfWeek}: End time exceeds 24 hours`, 400);
			}

			if (config.numberOfSlots < 1) {
				throw new AppError("Number of slots must be at least 1", 400);
			}

			if (config.price < 0) {
				throw new AppError("Price cannot be negative", 400);
			}
		}
	}
}
