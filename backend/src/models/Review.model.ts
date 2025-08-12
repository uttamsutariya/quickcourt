import { Schema, model, Types } from "mongoose";
import { IReview } from "../types/interfaces";
import { IReviewModel } from "../types/model-statics";

const reviewSchema = new Schema<IReview>(
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
		bookingId: {
			type: Schema.Types.ObjectId,
			ref: "Booking",
			required: [true, "Booking ID is required"],
			index: true,
		},
		rating: {
			type: Number,
			required: [true, "Rating is required"],
			min: [1, "Rating must be at least 1"],
			max: [5, "Rating cannot exceed 5"],
		},
		comment: {
			type: String,
			required: [true, "Comment is required"],
			trim: true,
			minlength: [10, "Comment must be at least 10 characters long"],
			maxlength: [1000, "Comment cannot exceed 1000 characters"],
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
reviewSchema.index({ venueId: 1, isActive: 1, createdAt: -1 });
reviewSchema.index({ userId: 1, venueId: 1 }, { unique: true }); // One review per user per venue
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ bookingId: 1 });
reviewSchema.index({ rating: 1 });

// Methods
reviewSchema.methods.deactivate = async function (): Promise<void> {
	this.isActive = false;
	await this.save();
};

// Statics
reviewSchema.statics.findByVenue = function (venueId: Types.ObjectId, includeInactive = false) {
	const query: any = { venueId };
	if (!includeInactive) {
		query.isActive = true;
	}
	return this.find(query).populate("userId", "name email avatarUrl").sort({ createdAt: -1 });
};

reviewSchema.statics.findByUser = function (userId: Types.ObjectId) {
	return this.find({ userId, isActive: true }).populate("venueId", "name images").sort({ createdAt: -1 });
};

reviewSchema.statics.getVenueRatingStats = async function (venueId: Types.ObjectId) {
	const stats = await this.aggregate([
		{
			$match: {
				venueId: new Types.ObjectId(venueId),
				isActive: true,
			},
		},
		{
			$group: {
				_id: null,
				averageRating: { $avg: "$rating" },
				totalReviews: { $sum: 1 },
				ratingDistribution: {
					$push: "$rating",
				},
			},
		},
		{
			$addFields: {
				ratingCounts: {
					5: {
						$size: {
							$filter: {
								input: "$ratingDistribution",
								cond: { $eq: ["$$this", 5] },
							},
						},
					},
					4: {
						$size: {
							$filter: {
								input: "$ratingDistribution",
								cond: { $eq: ["$$this", 4] },
							},
						},
					},
					3: {
						$size: {
							$filter: {
								input: "$ratingDistribution",
								cond: { $eq: ["$$this", 3] },
							},
						},
					},
					2: {
						$size: {
							$filter: {
								input: "$ratingDistribution",
								cond: { $eq: ["$$this", 2] },
							},
						},
					},
					1: {
						$size: {
							$filter: {
								input: "$ratingDistribution",
								cond: { $eq: ["$$this", 1] },
							},
						},
					},
				},
			},
		},
		{
			$project: {
				_id: 0,
				averageRating: { $round: ["$averageRating", 1] },
				totalReviews: 1,
				ratingCounts: 1,
			},
		},
	]);

	return (
		stats[0] || {
			averageRating: 0,
			totalReviews: 0,
			ratingCounts: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
		}
	);
};

reviewSchema.statics.hasUserReviewedVenue = async function (userId: Types.ObjectId, venueId: Types.ObjectId) {
	const existingReview = await this.findOne({ userId, venueId, isActive: true });
	return !!existingReview;
};

export const Review = model<IReview, IReviewModel>("Review", reviewSchema);
