import { Schema, model, Types } from "mongoose";
import { ICourtUnavailability } from "../types/interfaces";
import { UnavailabilityReason, DayOfWeek } from "../types/enums";
import { ICourtUnavailabilityModel } from "../types/model-statics";

const courtUnavailabilitySchema = new Schema<ICourtUnavailability>(
	{
		courtId: {
			type: Schema.Types.ObjectId,
			ref: "Court",
			required: [true, "Court ID is required"],
			index: true,
		},
		venueId: {
			type: Schema.Types.ObjectId,
			ref: "Venue",
			required: [true, "Venue ID is required"],
			index: true,
		},
		startDateTime: {
			type: Date,
			required: [true, "Start date/time is required"],
			index: true,
		},
		endDateTime: {
			type: Date,
			required: [true, "End date/time is required"],
			validate: {
				validator: function (endDate: Date) {
					return endDate > this.startDateTime;
				},
				message: "End date/time must be after start date/time",
			},
		},
		reason: {
			type: String,
			enum: Object.values(UnavailabilityReason),
			required: [true, "Reason for unavailability is required"],
		},
		description: {
			type: String,
			trim: true,
			maxlength: [500, "Description cannot exceed 500 characters"],
		},
		createdBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Creator ID is required"],
		},
		isRecurring: {
			type: Boolean,
			default: false,
		},
		recurringDays: {
			type: [String],
			enum: Object.values(DayOfWeek),
			validate: {
				validator: function (days: string[]) {
					// Only validate if isRecurring is true
					if (this.isRecurring) {
						return days && days.length > 0;
					}
					return true;
				},
				message: "At least one day must be selected for recurring unavailability",
			},
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// Indexes
courtUnavailabilitySchema.index({ courtId: 1, startDateTime: 1, endDateTime: 1 });
courtUnavailabilitySchema.index({ venueId: 1, startDateTime: 1 });
courtUnavailabilitySchema.index({ createdBy: 1 });
courtUnavailabilitySchema.index({ createdAt: -1 });

// Methods

// Check if a specific date/time falls within this unavailability period
courtUnavailabilitySchema.methods.isDateTimeUnavailable = function (dateTime: Date): boolean {
	if (this.isRecurring) {
		// Check if the day of week matches
		const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
		const dayOfWeek = dayNames[dateTime.getDay()] as DayOfWeek;

		if (!this.recurringDays.includes(dayOfWeek)) {
			return false;
		}

		// Check if time falls within the unavailable hours
		const requestTime = dateTime.getHours() * 60 + dateTime.getMinutes();
		const startTime = this.startDateTime.getHours() * 60 + this.startDateTime.getMinutes();
		const endTime = this.endDateTime.getHours() * 60 + this.endDateTime.getMinutes();

		return requestTime >= startTime && requestTime < endTime;
	} else {
		// Non-recurring: simple date range check
		return dateTime >= this.startDateTime && dateTime < this.endDateTime;
	}
};

// Check if a time slot overlaps with this unavailability
courtUnavailabilitySchema.methods.overlapsWithSlot = function (
	date: Date,
	startTime: string,
	endTime: string,
): boolean {
	const [startHour, startMinute] = startTime.split(":").map(Number);
	const [endHour, endMinute] = endTime.split(":").map(Number);

	const slotStart = new Date(date);
	slotStart.setHours(startHour, startMinute, 0, 0);

	const slotEnd = new Date(date);
	slotEnd.setHours(endHour, endMinute, 0, 0);

	if (this.isRecurring) {
		const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
		const dayOfWeek = dayNames[date.getDay()] as DayOfWeek;

		if (!this.recurringDays.includes(dayOfWeek)) {
			return false;
		}

		// For recurring, compare times only
		const slotStartMinutes = startHour * 60 + startMinute;
		const slotEndMinutes = endHour * 60 + endMinute;
		const unavailStartMinutes = this.startDateTime.getHours() * 60 + this.startDateTime.getMinutes();
		const unavailEndMinutes = this.endDateTime.getHours() * 60 + this.endDateTime.getMinutes();

		return (
			(slotStartMinutes >= unavailStartMinutes && slotStartMinutes < unavailEndMinutes) ||
			(slotEndMinutes > unavailStartMinutes && slotEndMinutes <= unavailEndMinutes) ||
			(slotStartMinutes <= unavailStartMinutes && slotEndMinutes >= unavailEndMinutes)
		);
	} else {
		// Non-recurring: check actual date/time overlap
		return (
			(slotStart >= this.startDateTime && slotStart < this.endDateTime) ||
			(slotEnd > this.startDateTime && slotEnd <= this.endDateTime) ||
			(slotStart <= this.startDateTime && slotEnd >= this.endDateTime)
		);
	}
};

// Statics

// Find unavailabilities for a court
courtUnavailabilitySchema.statics.findByCourtId = function (courtId: Types.ObjectId) {
	return this.find({ courtId }).sort({ startDateTime: 1 });
};

// Find unavailabilities for a court on a specific date
courtUnavailabilitySchema.statics.findByCourtAndDate = function (courtId: Types.ObjectId, date: Date) {
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(date);
	endOfDay.setHours(23, 59, 59, 999);

	return this.find({
		courtId,
		$or: [
			// Non-recurring unavailabilities that overlap with this date
			{
				isRecurring: false,
				$or: [
					{
						startDateTime: { $lte: endOfDay },
						endDateTime: { $gte: startOfDay },
					},
				],
			},
			// Recurring unavailabilities
			{
				isRecurring: true,
			},
		],
	});
};

// Check if a slot is unavailable due to maintenance/events
courtUnavailabilitySchema.statics.isSlotUnavailable = async function (
	courtId: Types.ObjectId,
	date: Date,
	startTime: string,
	endTime: string,
): Promise<boolean> {
	const unavailabilities = await (this as any).findByCourtAndDate(courtId, date);

	for (const unavailability of unavailabilities) {
		if (unavailability.overlapsWithSlot(date, startTime, endTime)) {
			return true;
		}
	}

	return false;
};

// Find all active unavailabilities for a venue
courtUnavailabilitySchema.statics.findActiveByVenue = function (venueId: Types.ObjectId) {
	const now = new Date();
	return this.find({
		venueId,
		$or: [{ endDateTime: { $gte: now }, isRecurring: false }, { isRecurring: true }],
	}).sort({ startDateTime: 1 });
};

export const CourtUnavailability = model<ICourtUnavailability, ICourtUnavailabilityModel>(
	"CourtUnavailability",
	courtUnavailabilitySchema,
);
