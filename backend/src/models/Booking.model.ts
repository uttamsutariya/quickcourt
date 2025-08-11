import { Schema, model, Types } from "mongoose";
import { IBooking } from "../types/interfaces";
import { BookingStatus, SlotDuration } from "../types/enums";
import { IBookingModel } from "../types/model-statics";

const bookingSchema = new Schema<IBooking>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "User ID is required"],
			index: true,
		},
		venueId: {
			type: Schema.Types.ObjectId,
			ref: "Venue",
			required: [true, "Venue ID is required"],
			index: true,
		},
		courtId: {
			type: Schema.Types.ObjectId,
			ref: "Court",
			required: [true, "Court ID is required"],
			index: true,
		},
		bookingDate: {
			type: Date,
			required: [true, "Booking date is required"],
			index: true,
			validate: {
				validator: function (date: Date) {
					// Ensure booking date is not in the past
					const today = new Date();
					today.setHours(0, 0, 0, 0);
					const bookingDay = new Date(date);
					bookingDay.setHours(0, 0, 0, 0);
					return bookingDay >= today;
				},
				message: "Booking date cannot be in the past",
			},
		},
		startTime: {
			type: String,
			required: [true, "Start time is required"],
			validate: {
				validator: function (time: string) {
					return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
				},
				message: "Start time must be in HH:MM format",
			},
		},
		endTime: {
			type: String,
			required: [true, "End time is required"],
			validate: {
				validator: function (time: string) {
					return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
				},
				message: "End time must be in HH:MM format",
			},
		},
		numberOfSlots: {
			type: Number,
			required: [true, "Number of slots is required"],
			min: [1, "At least one slot must be booked"],
			max: [8, "Maximum 8 slots can be booked at once"],
		},
		slotDuration: {
			type: Number,
			enum: Object.values(SlotDuration).filter((val) => typeof val === "number"),
			required: [true, "Slot duration is required"],
		},
		totalAmount: {
			type: Number,
			required: [true, "Total amount is required"],
			min: [0, "Total amount cannot be negative"],
		},
		status: {
			type: String,
			enum: Object.values(BookingStatus),
			default: BookingStatus.CONFIRMED,
			index: true,
		},
		cancellationReason: {
			type: String,
			trim: true,
			maxlength: [500, "Cancellation reason cannot exceed 500 characters"],
		},
		cancelledAt: {
			type: Date,
		},
		completedAt: {
			type: Date,
		},
		paymentSimulated: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// Compound indexes for common queries
bookingSchema.index({ userId: 1, status: 1, bookingDate: -1 });
bookingSchema.index({ courtId: 1, bookingDate: 1, startTime: 1 });
bookingSchema.index({ venueId: 1, bookingDate: -1 });
bookingSchema.index({ courtId: 1, bookingDate: 1, status: 1 });
bookingSchema.index({ createdAt: -1 });

// Unique compound index to prevent double bookings
bookingSchema.index(
	{ courtId: 1, bookingDate: 1, startTime: 1, endTime: 1 },
	{
		unique: true,
		partialFilterExpression: { status: { $ne: BookingStatus.CANCELLED } },
	},
);

// Methods

// Check if booking can be cancelled (at least 2 hours before)
bookingSchema.methods.canBeCancelled = function (): boolean {
	if (this.status !== BookingStatus.CONFIRMED) {
		return false;
	}

	const now = new Date();
	const bookingDateTime = new Date(this.bookingDate);
	const [hours, minutes] = this.startTime.split(":").map(Number);
	bookingDateTime.setHours(hours, minutes, 0, 0);

	const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

	return hoursUntilBooking >= 2; // At least 2 hours before
};

// Cancel booking
bookingSchema.methods.cancel = async function (reason?: string): Promise<void> {
	if (!this.canBeCancelled()) {
		throw new Error("Booking cannot be cancelled. Must be at least 2 hours before the booking time.");
	}

	this.status = BookingStatus.CANCELLED;
	this.cancellationReason = reason;
	this.cancelledAt = new Date();
	await this.save();
};

// Mark as completed
bookingSchema.methods.markAsCompleted = async function (): Promise<void> {
	this.status = BookingStatus.COMPLETED;
	this.completedAt = new Date();
	await this.save();
};

// Calculate end time based on start time and duration
bookingSchema.methods.calculateEndTime = function (): string {
	const [hours, minutes] = this.startTime.split(":").map(Number);
	const endHours = hours + this.numberOfSlots * this.slotDuration;
	return `${String(endHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Statics

// Find bookings for a specific court on a date
bookingSchema.statics.findByCourtAndDate = function (courtId: Types.ObjectId, date: Date) {
	const startOfDay = new Date(date);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(date);
	endOfDay.setHours(23, 59, 59, 999);

	return this.find({
		courtId,
		bookingDate: {
			$gte: startOfDay,
			$lte: endOfDay,
		},
		status: { $ne: BookingStatus.CANCELLED },
	}).sort({ startTime: 1 });
};

// Check if a time slot is available
bookingSchema.statics.isSlotAvailable = async function (
	courtId: Types.ObjectId,
	bookingDate: Date,
	startTime: string,
	endTime: string,
): Promise<boolean> {
	const startOfDay = new Date(bookingDate);
	startOfDay.setHours(0, 0, 0, 0);
	const endOfDay = new Date(bookingDate);
	endOfDay.setHours(23, 59, 59, 999);

	// Convert times to minutes for easier comparison
	const timeToMinutes = (time: string) => {
		const [hours, minutes] = time.split(":").map(Number);
		return hours * 60 + minutes;
	};

	const requestStartMinutes = timeToMinutes(startTime);
	const requestEndMinutes = timeToMinutes(endTime);

	const conflictingBookings = await this.find({
		courtId,
		bookingDate: {
			$gte: startOfDay,
			$lte: endOfDay,
		},
		status: { $ne: BookingStatus.CANCELLED },
	});

	for (const booking of conflictingBookings) {
		const bookingStartMinutes = timeToMinutes(booking.startTime);
		const bookingEndMinutes = timeToMinutes(booking.endTime);

		// Check for overlap
		if (
			(requestStartMinutes >= bookingStartMinutes && requestStartMinutes < bookingEndMinutes) ||
			(requestEndMinutes > bookingStartMinutes && requestEndMinutes <= bookingEndMinutes) ||
			(requestStartMinutes <= bookingStartMinutes && requestEndMinutes >= bookingEndMinutes)
		) {
			return false; // Slot is not available
		}
	}

	return true; // Slot is available
};

// Find user's upcoming bookings
bookingSchema.statics.findUpcomingByUser = function (userId: Types.ObjectId) {
	const now = new Date();
	return this.find({
		userId,
		bookingDate: { $gte: now },
		status: BookingStatus.CONFIRMED,
	}).sort({ bookingDate: 1, startTime: 1 });
};

// Find user's past bookings
bookingSchema.statics.findPastByUser = function (userId: Types.ObjectId) {
	const now = new Date();
	return this.find({
		userId,
		bookingDate: { $lt: now },
	}).sort({ bookingDate: -1, startTime: -1 });
};

// Pre-save validation to prevent overlapping bookings
bookingSchema.pre("save", async function (next) {
	if (this.isNew || this.isModified("status")) {
		if (this.status === BookingStatus.CONFIRMED) {
			const isAvailable = await (this.constructor as any).isSlotAvailable(
				this.courtId,
				this.bookingDate,
				this.startTime,
				this.endTime,
			);

			if (!isAvailable && this.isNew) {
				throw new Error("This time slot is already booked");
			}
		}
	}
	next();
});

export const Booking = model<IBooking, IBookingModel>("Booking", bookingSchema);
