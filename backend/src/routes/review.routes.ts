import { Router } from "express";
import {
	createReview,
	getVenueReviews,
	getUserReviews,
	updateReview,
	deleteReview,
	canUserReviewVenue,
} from "../controllers/review.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// Public routes
router.get("/venue/:venueId", getVenueReviews); // Get reviews for a venue (public)

// Protected routes (require authentication)
router.use(authMiddleware);

router.post("/", createReview); // Create a new review
router.get("/my-reviews", getUserReviews); // Get current user's reviews
router.get("/can-review/:venueId", canUserReviewVenue); // Check if user can review a venue
router.put("/:reviewId", updateReview); // Update a review
router.delete("/:reviewId", deleteReview); // Delete a review

export default router;
