import { Types } from "mongoose";
import { Court, Booking, CourtUnavailability } from "../models";
import { IAvailableSlot } from "../types/interfaces";
import { DayOfWeek } from "../types/enums";

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export const timeToMinutes = (time: string): number => {
	const [hours, minutes] = time.split(":").map(Number);
	return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export const minutesToTime = (minutes: number): string => {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

/**
 * Get day of week enum from Date object
 */
export const getDayOfWeek = (date: Date): DayOfWeek => {
	const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
	return dayNames[date.getDay()] as DayOfWeek;
};

/**
 * Check if two time ranges overlap
 */
export const doTimeSlotsOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
	const start1Min = timeToMinutes(start1);
	const end1Min = timeToMinutes(end1);
	const start2Min = timeToMinutes(start2);
	const end2Min = timeToMinutes(end2);

	return (
		(start1Min >= start2Min && start1Min < end2Min) ||
		(end1Min > start2Min && end1Min <= end2Min) ||
		(start1Min <= start2Min && end1Min >= end2Min)
	);
};

/**
 * Generate available slots for a court on a specific date
 */
export const generateAvailableSlots = async (courtId: Types.ObjectId, date: Date): Promise<IAvailableSlot[]> => {
	try {
		// Get the court
		const court = await Court.findById(courtId);
		if (!court || !court.isActive) {
			return [];
		}

		// Get the day's configuration
		const dayOfWeek = getDayOfWeek(date);
		const dayConfig = court.slotConfigurations.find((config) => config.dayOfWeek === dayOfWeek);

		if (!dayConfig || !dayConfig.isOpen) {
			return [];
		}

		// Generate all possible slots for the day
		const allSlots: IAvailableSlot[] = [];
		const startMin = timeToMinutes(dayConfig.startTime!);
		const slotDurationMin = dayConfig.slotDuration! * 60;

		for (let i = 0; i < dayConfig.numberOfSlots!; i++) {
			const slotStartMin = startMin + i * slotDurationMin;
			const slotEndMin = slotStartMin + slotDurationMin;

			allSlots.push({
				date,
				startTime: minutesToTime(slotStartMin),
				endTime: minutesToTime(slotEndMin),
				price: dayConfig.price || court.defaultPrice,
				isAvailable: true,
			});
		}

		// Get existing bookings for the court on this date
		const bookings = await Booking.findByCourtAndDate(courtId, date);

		// Get unavailabilities for the court on this date
		const unavailabilities = await CourtUnavailability.findByCourtAndDate(courtId, date);

		// Mark slots as unavailable based on bookings and unavailabilities
		for (const slot of allSlots) {
			// Check bookings
			for (const booking of bookings) {
				if (doTimeSlotsOverlap(slot.startTime, slot.endTime, booking.startTime, booking.endTime)) {
					slot.isAvailable = false;
					break;
				}
			}

			// Check unavailabilities (only if not already marked unavailable)
			if (slot.isAvailable) {
				for (const unavailability of unavailabilities) {
					if (unavailability.overlapsWithSlot(date, slot.startTime, slot.endTime)) {
						slot.isAvailable = false;
						break;
					}
				}
			}
		}

		return allSlots;
	} catch (error) {
		console.error("Error generating available slots:", error);
		return [];
	}
};

/**
 * Get available slots for multiple consecutive hours
 */
export const getConsecutiveSlots = async (
	courtId: Types.ObjectId,
	date: Date,
	numberOfHours: number,
): Promise<IAvailableSlot[][]> => {
	const availableSlots = await generateAvailableSlots(courtId, date);
	const consecutiveGroups: IAvailableSlot[][] = [];

	for (let i = 0; i <= availableSlots.length - numberOfHours; i++) {
		const group = availableSlots.slice(i, i + numberOfHours);

		// Check if all slots in the group are available and consecutive
		let isConsecutive = true;
		for (let j = 0; j < group.length; j++) {
			if (!group[j].isAvailable) {
				isConsecutive = false;
				break;
			}

			// Check if slots are consecutive (end time of current matches start time of next)
			if (j > 0 && group[j - 1].endTime !== group[j].startTime) {
				isConsecutive = false;
				break;
			}
		}

		if (isConsecutive) {
			consecutiveGroups.push(group);
		}
	}

	return consecutiveGroups;
};

/**
 * Calculate total price for multiple slots
 */
export const calculateTotalPrice = (slots: IAvailableSlot[]): number => {
	return slots.reduce((total, slot) => total + slot.price, 0);
};

/**
 * Get available slots for the next N days
 */
export const getAvailableSlotsForDays = async (
	courtId: Types.ObjectId,
	numberOfDays: number = 3,
): Promise<Map<string, IAvailableSlot[]>> => {
	const slotsMap = new Map<string, IAvailableSlot[]>();
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	for (let i = 0; i < numberOfDays; i++) {
		const date = new Date(today);
		date.setDate(date.getDate() + i);

		const slots = await generateAvailableSlots(courtId, date);
		const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD format

		slotsMap.set(dateKey, slots);
	}

	return slotsMap;
};

/**
 * Validate if a booking time is valid for a court
 */
export const validateBookingTime = async (
	courtId: Types.ObjectId,
	date: Date,
	startTime: string,
	endTime: string,
	numberOfSlots: number,
): Promise<{ isValid: boolean; message?: string }> => {
	try {
		const court = await Court.findById(courtId);
		if (!court) {
			return { isValid: false, message: "Court not found" };
		}

		// Check if the court is within operating hours
		if (!court.isWithinOperatingHours(date, startTime, endTime)) {
			return { isValid: false, message: "Booking time is outside operating hours" };
		}

		// Check if the slot is available
		const isAvailable = await Booking.isSlotAvailable(courtId, date, startTime, endTime);
		if (!isAvailable) {
			return { isValid: false, message: "This time slot is already booked" };
		}

		// Check for unavailabilities
		const isUnavailable = await CourtUnavailability.isSlotUnavailable(courtId, date, startTime, endTime);
		if (isUnavailable) {
			return { isValid: false, message: "Court is unavailable during this time" };
		}

		// Validate slot duration matches configuration
		const dayOfWeek = getDayOfWeek(date);
		const dayConfig = court.slotConfigurations.find((config) => config.dayOfWeek === dayOfWeek);

		if (!dayConfig || !dayConfig.isOpen) {
			return { isValid: false, message: "Court is closed on this day" };
		}

		const expectedDuration = numberOfSlots * dayConfig.slotDuration!;
		const actualDuration = (timeToMinutes(endTime) - timeToMinutes(startTime)) / 60;

		if (actualDuration !== expectedDuration) {
			return { isValid: false, message: "Invalid booking duration" };
		}

		return { isValid: true };
	} catch (error) {
		console.error("Error validating booking time:", error);
		return { isValid: false, message: "Error validating booking time" };
	}
};
