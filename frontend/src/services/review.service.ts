import apiClient from "@/lib/api-client";

export interface Review {
	_id: string;
	userId: {
		_id: string;
		name: string;
		email: string;
		avatarUrl?: string;
	};
	venueId:
		| string
		| {
				_id: string;
				name: string;
				images: string[];
		  };
	bookingId: string;
	rating: number;
	comment: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface RatingStats {
	averageRating: number;
	totalReviews: number;
	ratingCounts: {
		[key: number]: number;
	};
}

export interface ReviewsResponse {
	success: boolean;
	reviews: Review[];
	ratingStats: RatingStats;
	pagination: {
		currentPage: number;
		totalPages: number;
		totalReviews: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
	};
}

export interface CreateReviewData {
	venueId: string;
	bookingId: string;
	rating: number;
	comment: string;
}

export interface UpdateReviewData {
	rating?: number;
	comment?: string;
}

export interface CanReviewResponse {
	success: boolean;
	canReview: boolean;
	reason?: string;
	eligibleBookings?: Array<{
		_id: string;
		bookingDate: string;
		courtId: string;
	}>;
}

class ReviewService {
	// Create a new review
	async createReview(data: CreateReviewData): Promise<{ success: boolean; message: string; review: Review }> {
		const response = await apiClient.post<{ success: boolean; message: string; review: Review }>("/reviews", data);
		return response.data;
	}

	// Get reviews for a venue
	async getVenueReviews(venueId: string, page = 1, limit = 10): Promise<ReviewsResponse> {
		const response = await apiClient.get<ReviewsResponse>(`/reviews/venue/${venueId}?page=${page}&limit=${limit}`);
		return response.data;
	}

	// Get current user's reviews
	async getUserReviews(page = 1, limit = 10): Promise<ReviewsResponse> {
		const response = await apiClient.get<ReviewsResponse>(`/reviews/my-reviews?page=${page}&limit=${limit}`);
		return response.data;
	}

	// Update a review
	async updateReview(
		reviewId: string,
		data: UpdateReviewData,
	): Promise<{ success: boolean; message: string; review: Review }> {
		const response = await apiClient.put<{ success: boolean; message: string; review: Review }>(
			`/reviews/${reviewId}`,
			data,
		);
		return response.data;
	}

	// Delete a review
	async deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
		const response = await apiClient.delete<{ success: boolean; message: string }>(`/reviews/${reviewId}`);
		return response.data;
	}

	// Check if user can review a venue
	async canUserReviewVenue(venueId: string): Promise<CanReviewResponse> {
		const response = await apiClient.get<CanReviewResponse>(`/reviews/can-review/${venueId}`);
		return response.data;
	}
}

const reviewService = new ReviewService();
export default reviewService;
