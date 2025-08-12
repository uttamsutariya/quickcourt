// Static method interfaces for Mongoose models

import { Model, Types } from "mongoose";
import { IUser, IVenue, ICourt, IBooking, ICourtUnavailability, IAdminSettings, IReview } from "./interfaces";

// User Model Statics
export interface IUserModel extends Model<IUser> {
	findByWorkosId(workosId: string): Promise<IUser | null>;
	findByEmail(email: string): Promise<IUser | null>;
}

// Venue Model Statics
export interface IVenueModel extends Model<IVenue> {
	findApproved(): Promise<IVenue[]>;
	findByOwner(ownerId: Types.ObjectId): Promise<IVenue[]>;
	findPendingApproval(): Promise<IVenue[]>;
}

// Court Model Statics
export interface ICourtModel extends Model<ICourt> {
	findByVenue(venueId: Types.ObjectId): Promise<ICourt[]>;
	findBySport(sportType: string): Promise<ICourt[]>;
}

// Booking Model Statics
export interface IBookingModel extends Model<IBooking> {
	findByCourtAndDate(courtId: Types.ObjectId, date: Date): Promise<IBooking[]>;
	isSlotAvailable(courtId: Types.ObjectId, bookingDate: Date, startTime: string, endTime: string): Promise<boolean>;
	findUpcomingByUser(userId: Types.ObjectId): Promise<IBooking[]>;
	findPastByUser(userId: Types.ObjectId): Promise<IBooking[]>;
}

// CourtUnavailability Model Statics
export interface ICourtUnavailabilityModel extends Model<ICourtUnavailability> {
	findByCourtId(courtId: Types.ObjectId): Promise<ICourtUnavailability[]>;
	findByCourtAndDate(courtId: Types.ObjectId, date: Date): Promise<ICourtUnavailability[]>;
	isSlotUnavailable(courtId: Types.ObjectId, date: Date, startTime: string, endTime: string): Promise<boolean>;
	findActiveByVenue(venueId: Types.ObjectId): Promise<ICourtUnavailability[]>;
}

// AdminSettings Model Statics
export interface IAdminSettingsModel extends Model<IAdminSettings> {
	getSettings(): Promise<IAdminSettings>;
	updateSettings(updates: Partial<IAdminSettings>): Promise<IAdminSettings>;
}

// Review Model Statics
export interface IReviewModel extends Model<IReview> {
	findByVenue(venueId: Types.ObjectId, includeInactive?: boolean): Promise<IReview[]>;
	findByUser(userId: Types.ObjectId): Promise<IReview[]>;
	hasUserReviewedVenue(userId: Types.ObjectId, venueId: Types.ObjectId): Promise<boolean>;
	getVenueRatingStats(venueId: Types.ObjectId): Promise<{
		averageRating: number;
		totalReviews: number;
		ratingCounts: { [key: number]: number };
	}>;
}
