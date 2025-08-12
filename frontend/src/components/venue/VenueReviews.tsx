import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Star, User, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import reviewService, { type Review, type RatingStats } from "@/services/review.service";
import ReviewDialog from "./ReviewDialog";
import useAuthStore from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface VenueReviewsProps {
	venueId: string;
	venueName: string;
}

// Simple Card replacement using Tailwind
function TWCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	return <div className={cn("rounded-lg border bg-background shadow-sm", className)}>{children}</div>;
}
function TWCardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) {
	return <div className={cn("p-6", className)}>{children}</div>;
}

const VenueReviews = ({ venueId, venueName }: VenueReviewsProps) => {
	const { user, isAuthenticated } = useAuthStore();
	const [reviews, setReviews] = useState<Review[]>([]);
	const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [hasNextPage, setHasNextPage] = useState(false);
	const [hasPreviousPage, setHasPreviousPage] = useState(false);

	// Review dialog state
	const [showReviewDialog, setShowReviewDialog] = useState(false);
	const [canReview, setCanReview] = useState(false);
	const [eligibleBookings, setEligibleBookings] = useState<any[]>([]);
	const [checkingReviewEligibility, setCheckingReviewEligibility] = useState(false);

	const fetchReviews = async (page = 1) => {
		try {
			setIsLoading(true);
			const response = await reviewService.getVenueReviews(venueId, page, 5);
			setReviews(response.reviews);
			setRatingStats(response.ratingStats);
			setCurrentPage(response.pagination.currentPage);
			setTotalPages(response.pagination.totalPages);
			setHasNextPage(response.pagination.hasNextPage);
			setHasPreviousPage(response.pagination.hasPreviousPage);
		} catch (error: any) {
			console.error("Failed to fetch reviews:", error);
			toast.error("Failed to load reviews");
		} finally {
			setIsLoading(false);
		}
	};

	const checkReviewEligibility = async () => {
		if (!isAuthenticated || !user) return;

		try {
			setCheckingReviewEligibility(true);
			const response = await reviewService.canUserReviewVenue(venueId);
			setCanReview(response.canReview);
			if (response.eligibleBookings) {
				setEligibleBookings(response.eligibleBookings);
			}
		} catch (error: any) {
			console.error("Failed to check review eligibility:", error);
		} finally {
			setCheckingReviewEligibility(false);
		}
	};

	useEffect(() => {
		fetchReviews();
		checkReviewEligibility();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [venueId, isAuthenticated, user]);

	const handleReviewCreated = () => {
		fetchReviews(1); // Refresh reviews from first page
		setCanReview(false); // User can no longer review after submitting
	};

	const handleWriteReview = () => {
		if (!isAuthenticated) {
			toast.error("Please log in to write a review");
			return;
		}
		setShowReviewDialog(true);
	};

	const renderStars = (rating: number, size = "h-4 w-4") => {
		return (
			<div className="flex items-center gap-0.5">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star key={star} className={cn(size, star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
				))}
			</div>
		);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-IN", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const renderRatingDistribution = () => {
		if (!ratingStats || ratingStats.totalReviews === 0) return null;

		return (
			<div className="space-y-2">
				{[5, 4, 3, 2, 1].map((rating) => {
					const count = ratingStats.ratingCounts[rating] || 0;
					const percentage = ratingStats.totalReviews > 0 ? (count / ratingStats.totalReviews) * 100 : 0;

					return (
						<div key={rating} className="flex items-center gap-2 text-sm">
							<span className="w-2">{rating}</span>
							<Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
							<div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
								<div
									className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
									style={{ width: `${percentage}%` }}
								/>
							</div>
							<span className="w-8 text-xs text-muted-foreground">{count}</span>
						</div>
					);
				})}
			</div>
		);
	};

	return (
		<div className="space-y-6">
			{/* Header Section */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<h2 className="text-2xl font-bold">Reviews</h2>
					{ratingStats && ratingStats.totalReviews > 0 && (
						<div className="flex items-center gap-2">
							{renderStars(Math.round(ratingStats.averageRating), "h-5 w-5")}
							<span className="text-lg font-semibold">{ratingStats.averageRating.toFixed(1)}</span>
							<span className="text-sm text-muted-foreground">
								({ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? "s" : ""})
							</span>
						</div>
					)}
				</div>

				{isAuthenticated && (
					<Button
						onClick={handleWriteReview}
						disabled={!canReview || checkingReviewEligibility}
						className="flex items-center gap-2"
					>
						<MessageSquare className="h-4 w-4" />
						Write Review
					</Button>
				)}
			</div>

			{/* Rating Overview */}
			{ratingStats && ratingStats.totalReviews > 0 && (
				<TWCard>
					<TWCardContent>
						<div className="grid md:grid-cols-2 gap-6">
							{/* Average Rating */}
							<div className="flex flex-col items-center justify-center text-center">
								<div className="text-4xl font-bold mb-2">{ratingStats.averageRating.toFixed(1)}</div>
								<div className="flex items-center justify-center">
									{renderStars(Math.round(ratingStats.averageRating), "h-6 w-6")}
								</div>
								<div className="text-sm text-muted-foreground mt-2">
									Based on {ratingStats.totalReviews} review{ratingStats.totalReviews !== 1 ? "s" : ""}
								</div>
							</div>

							{/* Rating Distribution */}
							<div>{renderRatingDistribution()}</div>
						</div>
					</TWCardContent>
				</TWCard>
			)}

			{/* Reviews List */}
			<div className="space-y-4">
				{isLoading ? (
					// Loading skeleton
					Array.from({ length: 3 }).map((_, index) => (
						<TWCard key={index}>
							<TWCardContent>
								<div className="flex items-start gap-4">
									<Skeleton className="h-10 w-10 rounded-full" />
									<div className="flex-1 space-y-2">
										<div className="flex items-center gap-2">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-4 w-20" />
										</div>
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-3/4" />
									</div>
								</div>
							</TWCardContent>
						</TWCard>
					))
				) : reviews.length > 0 ? (
					reviews.map((review) => (
						<TWCard key={review._id}>
							<TWCardContent>
								<div className="flex items-start gap-4">
									{/* User Avatar */}
									<div className="flex-shrink-0">
										{review.userId.avatarUrl ? (
											<img
												src={review.userId.avatarUrl}
												alt={review.userId.name}
												className="h-10 w-10 rounded-full object-cover"
											/>
										) : (
											<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
												<User className="h-5 w-5 text-primary" />
											</div>
										)}
									</div>

									{/* Review Content */}
									<div className="flex-1 space-y-2">
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												<h4 className="font-semibold">{review.userId.name}</h4>
												{renderStars(review.rating)}
												<Badge variant="secondary" className="text-xs">
													{review.rating} star{review.rating !== 1 ? "s" : ""}
												</Badge>
											</div>
											<span className="text-sm text-muted-foreground">{formatDate(review.createdAt)}</span>
										</div>

										<p className="text-muted-foreground leading-relaxed">{review.comment}</p>
									</div>
								</div>
							</TWCardContent>
						</TWCard>
					))
				) : (
					// No reviews state
					<TWCard>
						<TWCardContent className="p-12 text-center">
							<MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
							<p className="text-muted-foreground mb-4">Be the first to share your experience at this venue!</p>
							{isAuthenticated && canReview && (
								<Button onClick={handleWriteReview} className="flex items-center gap-2 mx-auto">
									<MessageSquare className="h-4 w-4" />
									Write First Review
								</Button>
							)}
						</TWCardContent>
					</TWCard>
				)}
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="flex items-center justify-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => fetchReviews(currentPage - 1)}
						disabled={!hasPreviousPage || isLoading}
					>
						<ChevronLeft className="h-4 w-4 mr-1" />
						Previous
					</Button>

					<div className="flex items-center gap-1">
						{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
							let page;
							if (totalPages <= 5) {
								page = i + 1;
							} else if (currentPage <= 3) {
								page = i + 1;
							} else if (currentPage >= totalPages - 2) {
								page = totalPages - 4 + i;
							} else {
								page = currentPage - 2 + i;
							}

							return (
								<Button
									key={page}
									variant={currentPage === page ? "default" : "outline"}
									size="sm"
									onClick={() => fetchReviews(page)}
									disabled={isLoading}
									className="w-10"
								>
									{page}
								</Button>
							);
						})}
					</div>

					<Button
						variant="outline"
						size="sm"
						onClick={() => fetchReviews(currentPage + 1)}
						disabled={!hasNextPage || isLoading}
					>
						Next
						<ChevronRight className="h-4 w-4 ml-1" />
					</Button>
				</div>
			)}

			{/* Review Dialog */}
			<ReviewDialog
				isOpen={showReviewDialog}
				onClose={() => setShowReviewDialog(false)}
				venueId={venueId}
				venueName={venueName}
				eligibleBookings={eligibleBookings}
				onReviewCreated={handleReviewCreated}
			/>
		</div>
	);
};

export default VenueReviews;
