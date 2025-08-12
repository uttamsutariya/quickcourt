// Interfaces for the QuickCourt application

import { Document, Types } from "mongoose";
import {
	UserRole,
	VenueStatus,
	VenueType,
	BookingStatus,
	DayOfWeek,
	SportType,
	UnavailabilityReason,
	SlotDuration,
} from "./enums";

// User Interface
export interface IUser extends Document {
	workosId: string;
	email: string;
	name: string;
	avatarUrl?: string;
	role: UserRole;
	phoneNumber?: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Venue Interface
export interface IVenue extends Document {
	ownerId: Types.ObjectId;
	name: string;
	description: string;
	address: {
		street: string;
		city: string;
		state: string;
		zipCode: string;
		country: string;
	};
	location: {
		type: string;
		coordinates: [number, number]; // [longitude, latitude]
	};
	venueType: VenueType;
	sports: SportType[];
	amenities: string[];
	images: string[]; // Cloudinary URLs
	status: VenueStatus;
	rejectionReason?: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Slot Configuration for each day of the week
export interface ISlotConfiguration {
	dayOfWeek: DayOfWeek;
	isOpen: boolean;
	startTime?: string; // Format: "09:00"
	slotDuration?: SlotDuration; // in hours
	numberOfSlots?: number;
	price?: number; // Price per slot for this day
}

// Court Interface
export interface ICourt extends Document {
	venueId: Types.ObjectId;
	name: string;
	sportType: SportType;
	description?: string;
	defaultPrice: number; // Default price per slot
	slotConfigurations: ISlotConfiguration[];
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
	// Instance methods
	getSlotConfigForDay(dayOfWeek: DayOfWeek): ISlotConfiguration | undefined;
	generateSlotsForDate(date: Date): any[];
	isWithinOperatingHours(date: Date, startTime: string, endTime: string): boolean;
}

// Booking Interface
export interface IBooking extends Document {
	userId: Types.ObjectId;
	venueId: Types.ObjectId;
	courtId: Types.ObjectId;
	bookingDate: Date;
	startTime: string; // Format: "09:00"
	endTime: string; // Format: "11:00"
	numberOfSlots: number;
	slotDuration: SlotDuration;
	totalAmount: number;
	status: BookingStatus;
	cancellationReason?: string;
	cancelledAt?: Date;
	completedAt?: Date;
	paymentSimulated: boolean;
	createdAt: Date;
	updatedAt: Date;
	// Instance methods
	canBeCancelled(): boolean;
	cancel(reason?: string): Promise<void>;
	markAsCompleted(): Promise<void>;
	calculateEndTime(): string;
}

// Court Unavailability Interface
export interface ICourtUnavailability extends Document {
	courtId: Types.ObjectId;
	venueId: Types.ObjectId;
	startDateTime: Date;
	endDateTime: Date;
	reason: UnavailabilityReason;
	description?: string;
	createdBy: Types.ObjectId; // Facility owner who created this
	isRecurring: boolean;
	recurringDays?: DayOfWeek[]; // If recurring, which days
	createdAt: Date;
	updatedAt: Date;
	// Instance methods
	isDateTimeUnavailable(dateTime: Date): boolean;
	overlapsWithSlot(date: Date, startTime: string, endTime: string): boolean;
}

// Admin Settings Interface
export interface IAdminSettings extends Document {
	commissionPercentage: number; // Default 10%
	minBookingAdvanceHours: number; // Minimum hours before booking
	maxBookingAdvanceDays: number; // Maximum days in advance for booking
	cancellationMinHours: number; // Minimum hours before cancellation (2-3 hours)
	createdAt: Date;
	updatedAt: Date;
	// Instance methods
	isBookingDateAllowed(date: Date): boolean;
	calculateCommission(amount: number): number;
	calculateOwnerEarnings(amount: number): number;
}

// Review Interface
export interface IReview extends Document {
	userId: Types.ObjectId;
	venueId: Types.ObjectId;
	bookingId: Types.ObjectId;
	rating: number; // 1-5 stars
	comment: string;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Helper interface for available slots (not a DB model)
export interface IAvailableSlot {
	date: Date;
	startTime: string;
	endTime: string;
	price: number;
	isAvailable: boolean;
}
