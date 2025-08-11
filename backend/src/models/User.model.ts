import { Schema, model } from "mongoose";
import { IUser } from "../types/interfaces";
import { UserRole } from "../types/enums";
import { IUserModel } from "../types/model-statics";

const userSchema = new Schema<IUser>(
	{
		workosId: {
			type: String,
			required: [true, "WorkOS ID is required"],
			unique: true,
			index: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			index: true,
			match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
		},
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			minlength: [2, "Name must be at least 2 characters long"],
			maxlength: [100, "Name cannot exceed 100 characters"],
		},
		avatarUrl: {
			type: String,
			trim: true,
		},
		role: {
			type: String,
			enum: Object.values(UserRole),
			default: UserRole.USER,
			required: true,
			index: true,
		},
		phoneNumber: {
			type: String,
			trim: true,
			match: [/^[0-9]{10,15}$/, "Please provide a valid phone number"],
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

// Compound indexes for common queries
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for getting user's venues (for facility owners)
userSchema.virtual("venues", {
	ref: "Venue",
	localField: "_id",
	foreignField: "ownerId",
});

// Virtual for getting user's bookings
userSchema.virtual("bookings", {
	ref: "Booking",
	localField: "_id",
	foreignField: "userId",
});

// Methods
userSchema.methods.isFacilityOwner = function (): boolean {
	return this.role === UserRole.FACILITY_OWNER;
};

userSchema.methods.isAdmin = function (): boolean {
	return this.role === UserRole.ADMIN;
};

userSchema.methods.isUser = function (): boolean {
	return this.role === UserRole.USER;
};

// Statics
userSchema.statics.findByWorkosId = function (workosId: string) {
	return this.findOne({ workosId, isActive: true });
};

userSchema.statics.findByEmail = function (email: string) {
	return this.findOne({ email: email.toLowerCase(), isActive: true });
};

export const User = model<IUser, IUserModel>("User", userSchema);
