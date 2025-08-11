import { Schema, model, Types } from "mongoose";
import { ICourt, ISlotConfiguration } from "../types/interfaces";
import { DayOfWeek, SportType, SlotDuration } from "../types/enums";
import { ICourtModel } from "../types/model-statics";

const slotConfigurationSchema = new Schema<ISlotConfiguration>(
	{
		dayOfWeek: {
			type: String,
			enum: Object.values(DayOfWeek),
			required: true,
		},
		isOpen: {
			type: Boolean,
			default: true,
		},
		startTime: {
			type: String,
			validate: {
				validator: function (time: string) {
					if (!this.isOpen) return true; // No validation if closed
					return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
				},
				message: "Start time must be in HH:MM format",
			},
		},
		slotDuration: {
			type: Number,
			enum: Object.values(SlotDuration).filter((val) => typeof val === "number"),
			validate: {
				validator: function (duration: number) {
					if (!this.isOpen) return true; // No validation if closed
					return duration >= 1 && duration <= 4 && Number.isInteger(duration);
				},
				message: "Slot duration must be between 1 and 4 hours",
			},
		},
		numberOfSlots: {
			type: Number,
			validate: {
				validator: function (slots: number) {
					if (!this.isOpen) return true; // No validation if closed
					return slots >= 1 && slots <= 24;
				},
				message: "Number of slots must be between 1 and 24",
			},
		},
		price: {
			type: Number,
			min: [0, "Price cannot be negative"],
			validate: {
				validator: function (price: number) {
					if (!this.isOpen) return true; // No validation if closed
					return price > 0;
				},
				message: "Price must be greater than 0 when court is open",
			},
		},
	},
	{ _id: false },
);

const courtSchema = new Schema<ICourt>(
	{
		venueId: {
			type: Schema.Types.ObjectId,
			ref: "Venue",
			required: [true, "Venue ID is required"],
			index: true,
		},
		name: {
			type: String,
			required: [true, "Court name is required"],
			trim: true,
			minlength: [2, "Court name must be at least 2 characters long"],
			maxlength: [50, "Court name cannot exceed 50 characters"],
		},
		sportType: {
			type: String,
			enum: Object.values(SportType),
			required: [true, "Sport type is required"],
			index: true,
		},
		description: {
			type: String,
			trim: true,
			maxlength: [500, "Description cannot exceed 500 characters"],
		},
		defaultPrice: {
			type: Number,
			required: [true, "Default price is required"],
			min: [0, "Price cannot be negative"],
		},
		slotConfigurations: {
			type: [slotConfigurationSchema],
			required: true,
			validate: {
				validator: function (configs: ISlotConfiguration[]) {
					// Ensure all 7 days are configured
					const days = configs.map((c) => c.dayOfWeek);
					const uniqueDays = new Set(days);
					return uniqueDays.size === 7 && configs.length === 7;
				},
				message: "Configuration for all 7 days of the week is required",
			},
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// Indexes
courtSchema.index({ venueId: 1, isActive: 1 });
courtSchema.index({ venueId: 1, sportType: 1 });
courtSchema.index({ createdAt: -1 });

// Virtual for bookings
courtSchema.virtual("bookings", {
	ref: "Booking",
	localField: "_id",
	foreignField: "courtId",
});

// Virtual for unavailabilities
courtSchema.virtual("unavailabilities", {
	ref: "CourtUnavailability",
	localField: "_id",
	foreignField: "courtId",
});

// Get slot configuration for a specific day
courtSchema.methods.getSlotConfigForDay = function (dayOfWeek: DayOfWeek): ISlotConfiguration | undefined {
	return this.slotConfigurations.find((config: ISlotConfiguration) => config.dayOfWeek === dayOfWeek);
};

// Generate time slots for a specific date
courtSchema.methods.generateSlotsForDate = function (date: Date): any[] {
	const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
	const dayOfWeek = dayNames[date.getDay()] as DayOfWeek;

	const config = this.getSlotConfigForDay(dayOfWeek);

	if (!config || !config.isOpen) {
		return [];
	}

	const slots = [];
	const [startHour, startMinute] = config.startTime!.split(":").map(Number);

	for (let i = 0; i < config.numberOfSlots!; i++) {
		const slotStartHour = startHour + i * config.slotDuration!;
		const slotEndHour = slotStartHour + config.slotDuration!;

		slots.push({
			startTime: `${String(slotStartHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`,
			endTime: `${String(slotEndHour).padStart(2, "0")}:${String(startMinute).padStart(2, "0")}`,
			duration: config.slotDuration,
			price: config.price || this.defaultPrice,
		});
	}

	return slots;
};

// Check if a time slot is within operating hours
courtSchema.methods.isWithinOperatingHours = function (date: Date, startTime: string, endTime: string): boolean {
	const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
	const dayOfWeek = dayNames[date.getDay()] as DayOfWeek;

	const config = this.getSlotConfigForDay(dayOfWeek);

	if (!config || !config.isOpen) {
		return false;
	}

	const [configStartHour] = config.startTime!.split(":").map(Number);
	const [requestStartHour] = startTime.split(":").map(Number);
	const [requestEndHour] = endTime.split(":").map(Number);

	const configEndHour = configStartHour + config.numberOfSlots! * config.slotDuration!;

	return requestStartHour >= configStartHour && requestEndHour <= configEndHour;
};

// Statics
courtSchema.statics.findByVenue = function (venueId: Types.ObjectId) {
	return this.find({ venueId, isActive: true });
};

courtSchema.statics.findBySport = function (sportType: SportType) {
	return this.find({ sportType, isActive: true });
};

// Pre-save hook to initialize slot configurations if not provided
courtSchema.pre("save", function (next) {
	if (this.isNew && (!this.slotConfigurations || this.slotConfigurations.length === 0)) {
		// Initialize with default configurations for all days
		this.slotConfigurations = Object.values(DayOfWeek).map((day) => ({
			dayOfWeek: day,
			isOpen: true,
			startTime: "09:00",
			slotDuration: SlotDuration.ONE_HOUR,
			numberOfSlots: 8,
			price: this.defaultPrice,
		}));
	}
	next();
});

export const Court = model<ICourt, ICourtModel>("Court", courtSchema);
