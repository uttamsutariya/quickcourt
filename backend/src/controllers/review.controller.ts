import { Request, Response, NextFunction } from "express";
import { Review, Booking, Venue } from "../models";
import { BookingStatus } from "../types/enums";
import { BadRequestError, NotFoundError, ForbiddenError } from "../utils/errors";
import { Types } from "mongoose";

// Create a new review
export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { venueId, bookingId, rating, comment } = req.body;
		const userId = req.user._id;

		// Validate required fields
		if (!venueId || !bookingId || !rating || !comment) {
			throw new BadRequestError("All fields (venueId, bookingId, rating, comment) are required");
		}

		// Validate rating
		if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
			throw new BadRequestError("Rating must be a whole number between 1 and 5");
		}

		// Check if venue exists
		const venue = await Venue.findById(venueId);
		if (!venue) {
			throw new NotFoundError("Venue not found");
		}

		// Check if booking exists and belongs to the user
		const booking = await Booking.findById(bookingId);
		if (!booking) {
			throw new NotFoundError("Booking not found");
		}

		if (booking.userId.toString() !== userId.toString()) {
			throw new ForbiddenError("You can only review venues for your own bookings");
		}

		if (booking.venueId.toString() !== venueId) {
			throw new BadRequestError("Booking does not match the venue");
		}

		// Check if booking is confirmed or completed (allow reviews for ongoing bookings)
		if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.COMPLETED) {
			throw new BadRequestError("You can only review venues for confirmed or completed bookings");
		}

		// Check if user has already reviewed this venue
		const existingReview = await Review.hasUserReviewedVenue(userId, venueId);
		if (existingReview) {
			throw new BadRequestError("You have already reviewed this venue");
		}

		// Create the review
		const review = new Review({
			userId,
			venueId,
			bookingId,
			rating,
			comment: comment.trim(),
		});

		await review.save();

		// Populate user details for response
		await review.populate("userId", "name email avatarUrl");

		res.status(201).json({
			success: true,
			message: "Review created successfully",
			review,
		});
	} catch (error) {
		next(error);
	}
};

// Get reviews for a venue
export const getVenueReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { venueId } = req.params;
		const { page = 1, limit = 10 } = req.query;

		if (!Types.ObjectId.isValid(venueId)) {
			throw new BadRequestError("Invalid venue ID");
		}

		// Check if venue exists
		const venue = await Venue.findById(venueId);
		if (!venue) {
			throw new NotFoundError("Venue not found");
		}

		const pageNum = parseInt(page as string, 10);
		const limitNum = parseInt(limit as string, 10);
		const skip = (pageNum - 1) * limitNum;

		// Get reviews with pagination
		const reviews = await Review.find({ venueId, isActive: true })
			.populate("userId", "name email avatarUrl")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limitNum);

		// Get total count for pagination
		const totalReviews = await Review.countDocuments({ venueId, isActive: true });

		// Get rating statistics
		const ratingStats = await (Review as any).getVenueRatingStats(new Types.ObjectId(venueId));

		res.status(200).json({
			success: true,
			reviews,
			ratingStats,
			pagination: {
				currentPage: pageNum,
				totalPages: Math.ceil(totalReviews / limitNum),
				totalReviews,
				hasNextPage: pageNum < Math.ceil(totalReviews / limitNum),
				hasPreviousPage: pageNum > 1,
			},
		});
	} catch (error) {
		next(error);
	}
};

// Get user's reviews
export const getUserReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const userId = req.user._id;
		const { page = 1, limit = 10 } = req.query;

		const pageNum = parseInt(page as string, 10);
		const limitNum = parseInt(limit as string, 10);
		const skip = (pageNum - 1) * limitNum;

		const reviews = await Review.find({ userId, isActive: true })
			.populate("venueId", "name images")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limitNum);

		const totalReviews = await Review.countDocuments({ userId, isActive: true });

		res.status(200).json({
			success: true,
			reviews,
			pagination: {
				currentPage: pageNum,
				totalPages: Math.ceil(totalReviews / limitNum),
				totalReviews,
				hasNextPage: pageNum < Math.ceil(totalReviews / limitNum),
				hasPreviousPage: pageNum > 1,
			},
		});
	} catch (error) {
		next(error);
	}
};

// Update a review
export const updateReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { reviewId } = req.params;
		const { rating, comment } = req.body;
		const userId = req.user._id;

		if (!Types.ObjectId.isValid(reviewId)) {
			throw new BadRequestError("Invalid review ID");
		}

		// Find the review
		const review = await Review.findById(reviewId);
		if (!review) {
			throw new NotFoundError("Review not found");
		}

		// Check if the review belongs to the user
		if (review.userId.toString() !== userId.toString()) {
			throw new ForbiddenError("You can only update your own reviews");
		}

		// Validate rating if provided
		if (rating !== undefined) {
			if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
				throw new BadRequestError("Rating must be a whole number between 1 and 5");
			}
			review.rating = rating;
		}

		// Update comment if provided
		if (comment !== undefined) {
			if (typeof comment !== "string" || comment.trim().length < 10) {
				throw new BadRequestError("Comment must be at least 10 characters long");
			}
			(review as any).comment = comment.trim();
		}

		await review.save();

		// Populate user details for response
		await review.populate("userId", "name email avatarUrl");

		res.status(200).json({
			success: true,
			message: "Review updated successfully",
			review,
		});
	} catch (error) {
		next(error);
	}
};

// Delete a review (soft delete)
export const deleteReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { reviewId } = req.params;
		const userId = req.user._id;

		if (!Types.ObjectId.isValid(reviewId)) {
			throw new BadRequestError("Invalid review ID");
		}

		// Find the review
		const review = await Review.findById(reviewId);
		if (!review) {
			throw new NotFoundError("Review not found");
		}

		// Check if the review belongs to the user
		if (review.userId.toString() !== userId.toString()) {
			throw new ForbiddenError("You can only delete your own reviews");
		}

		// Soft delete the review
		await (review as any).deactivate();

		res.status(200).json({
			success: true,
			message: "Review deleted successfully",
		});
	} catch (error) {
		next(error);
	}
};

// Check if user can review a venue
export const canUserReviewVenue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		const { venueId } = req.params;
		const userId = req.user._id;

		if (!Types.ObjectId.isValid(venueId)) {
			throw new BadRequestError("Invalid venue ID");
		}

		// Check if venue exists
		const venue = await Venue.findById(venueId);
		if (!venue) {
			throw new NotFoundError("Venue not found");
		}

		// Check if user has already reviewed this venue
		const hasReviewed = await Review.hasUserReviewedVenue(userId, new Types.ObjectId(venueId));
		if (hasReviewed) {
			res.status(200).json({
				success: true,
				canReview: false,
				reason: "You have already reviewed this venue",
			});
			return;
		}

		// Check if user has confirmed or completed bookings for this venue
		const eligibleBookings = await Booking.find({
			userId,
			venueId,
			status: { $in: [BookingStatus.CONFIRMED, BookingStatus.COMPLETED] },
		});

		if (eligibleBookings.length === 0) {
			res.status(200).json({
				success: true,
				canReview: false,
				reason: "You need to have a confirmed booking at this venue before you can review it",
			});
			return;
		}

		// User can review
		res.status(200).json({
			success: true,
			canReview: true,
			eligibleBookings: eligibleBookings.map((booking) => ({
				_id: booking._id,
				bookingDate: booking.bookingDate,
				courtId: booking.courtId,
			})),
		});
	} catch (error) {
		next(error);
	}
};
