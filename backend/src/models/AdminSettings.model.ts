import { Schema, model } from "mongoose";
import { IAdminSettings } from "../types/interfaces";
import { IAdminSettingsModel } from "../types/model-statics";

const adminSettingsSchema = new Schema<IAdminSettings>(
	{
		commissionPercentage: {
			type: Number,
			required: [true, "Commission percentage is required"],
			min: [0, "Commission percentage cannot be negative"],
			max: [100, "Commission percentage cannot exceed 100"],
			default: 10,
		},
		minBookingAdvanceHours: {
			type: Number,
			required: true,
			min: [0, "Minimum booking advance hours cannot be negative"],
			default: 0, // No minimum advance booking time
		},
		maxBookingAdvanceDays: {
			type: Number,
			required: true,
			min: [1, "Maximum booking advance days must be at least 1"],
			max: [365, "Maximum booking advance days cannot exceed 365"],
			default: 7, // 7 days in advance
		},
		cancellationMinHours: {
			type: Number,
			required: true,
			min: [0, "Cancellation minimum hours cannot be negative"],
			default: 2, // 2 hours before booking
		},
	},
	{
		timestamps: true,
		versionKey: false,
	},
);

// Ensure only one settings document exists
adminSettingsSchema.index({}, { unique: true });

// Calculate commission for a booking amount
adminSettingsSchema.methods.calculateCommission = function (bookingAmount: number): number {
	return (bookingAmount * this.commissionPercentage) / 100;
};

// Calculate facility owner's earnings after commission
adminSettingsSchema.methods.calculateOwnerEarnings = function (bookingAmount: number): number {
	const commission = this.calculateCommission(bookingAmount);
	return bookingAmount - commission;
};

// Check if a booking date is within allowed advance booking period
adminSettingsSchema.methods.isBookingDateAllowed = function (bookingDate: Date): boolean {
	const maxDate = new Date();
	maxDate.setDate(maxDate.getDate() + this.maxBookingAdvanceDays);

	const minDate = new Date();
	minDate.setHours(minDate.getHours() + this.minBookingAdvanceHours);

	return bookingDate >= minDate && bookingDate <= maxDate;
};

// Check if a booking can be cancelled based on time
adminSettingsSchema.methods.canCancelBooking = function (bookingDateTime: Date): boolean {
	const now = new Date();
	const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

	return hoursUntilBooking >= this.cancellationMinHours;
};

// Statics

// Get or create the singleton settings document
adminSettingsSchema.statics.getSettings = async function (): Promise<IAdminSettings> {
	let settings = await this.findOne();

	if (!settings) {
		// Create default settings if none exist
		settings = await this.create({
			commissionPercentage: 10,
			minBookingAdvanceHours: 0,
			maxBookingAdvanceDays: 7,
			cancellationMinHours: 2,
		});
	}

	return settings;
};

// Update settings
adminSettingsSchema.statics.updateSettings = async function (
	updates: Partial<IAdminSettings>,
): Promise<IAdminSettings> {
	const settings = await (this as any).getSettings();

	Object.assign(settings, updates);
	await settings.save();

	return settings;
};

export const AdminSettings = model<IAdminSettings, IAdminSettingsModel>("AdminSettings", adminSettingsSchema);
