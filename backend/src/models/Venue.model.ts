import { Schema, model, Types } from "mongoose";
import { IVenue } from "../types/interfaces";
import { VenueStatus, SportType } from "../types/enums";
import { IVenueModel } from "../types/model-statics";

const venueSchema = new Schema<IVenue>(
	{
		ownerId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Owner ID is required"],
			index: true,
		},
		name: {
			type: String,
			required: [true, "Venue name is required"],
			trim: true,
			minlength: [3, "Venue name must be at least 3 characters long"],
			maxlength: [100, "Venue name cannot exceed 100 characters"],
		},
		description: {
			type: String,
			required: [true, "Description is required"],
			trim: true,
			minlength: [10, "Description must be at least 10 characters long"],
			maxlength: [1000, "Description cannot exceed 1000 characters"],
		},
		address: {
			street: {
				type: String,
				required: [true, "Street address is required"],
				trim: true,
			},
			city: {
				type: String,
				required: [true, "City is required"],
				trim: true,
			},
			state: {
				type: String,
				required: [true, "State is required"],
				trim: true,
			},
			zipCode: {
				type: String,
				required: [true, "Zip code is required"],
				trim: true,
			},
			country: {
				type: String,
				required: [true, "Country is required"],
				trim: true,
				default: "India",
			},
		},
		location: {
			type: {
				type: String,
				enum: ["Point"],
			},
			coordinates: {
				type: [Number],
			},
		},
		sports: {
			type: [String],
			enum: Object.values(SportType),
			required: [true, "At least one sport type is required"],
			validate: {
				validator: function (sports: string[]) {
					return sports && sports.length > 0;
				},
				message: "At least one sport type must be selected",
			},
		},
		amenities: {
			type: [String],
			default: [],
		},
		images: {
			type: [String], // Cloudinary URLs
			default: [],
			validate: {
				validator: function (images: string[]) {
					return images.length <= 10;
				},
				message: "Maximum 10 images allowed per venue",
			},
		},
		status: {
			type: String,
			enum: Object.values(VenueStatus),
			default: VenueStatus.PENDING,
			index: true,
		},
		rejectionReason: {
			type: String,
			trim: true,
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
venueSchema.index({ ownerId: 1, status: 1 });
venueSchema.index({ status: 1, isActive: 1 });
venueSchema.index({ sports: 1 });
venueSchema.index({ "address.city": 1 });
venueSchema.index({ location: "2dsphere" }, { sparse: true }); // For geospatial queries - sparse index for optional location
venueSchema.index({ createdAt: -1 });
venueSchema.index({ name: "text", description: "text" }); // For text search

// Virtual for courts
venueSchema.virtual("courts", {
	ref: "Court",
	localField: "_id",
	foreignField: "venueId",
});

// Virtual for bookings
venueSchema.virtual("bookings", {
	ref: "Booking",
	localField: "_id",
	foreignField: "venueId",
});

// Methods
venueSchema.methods.isApproved = function (): boolean {
	return this.status === VenueStatus.APPROVED;
};

venueSchema.methods.isPending = function (): boolean {
	return this.status === VenueStatus.PENDING;
};

venueSchema.methods.isRejected = function (): boolean {
	return this.status === VenueStatus.REJECTED;
};

// Calculate average price from courts
venueSchema.methods.getStartingPrice = async function (): Promise<number> {
	const Court = model("Court");
	const courts = await Court.find({ venueId: this._id, isActive: true });

	if (courts.length === 0) return 0;

	const prices = courts.map((court: any) => court.defaultPrice);
	return Math.min(...prices);
};

// Statics
venueSchema.statics.findApproved = function () {
	return this.find({ status: VenueStatus.APPROVED, isActive: true });
};

venueSchema.statics.findByOwner = function (ownerId: Types.ObjectId) {
	return this.find({ ownerId, isActive: true });
};

venueSchema.statics.findPendingApproval = function () {
	return this.find({ status: VenueStatus.PENDING, isActive: true });
};

export const Venue = model<IVenue, IVenueModel>("Venue", venueSchema);
