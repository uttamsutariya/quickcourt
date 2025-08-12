import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import reviewService, { type CreateReviewData } from "@/services/review.service";
import { cn } from "@/lib/utils";

interface ReviewDialogProps {
	isOpen: boolean;
	onClose: () => void;
	venueId: string;
	venueName: string;
	eligibleBookings: Array<{
		_id: string;
		bookingDate: string;
		courtId: string;
	}>;
	onReviewCreated: () => void;
}

const ReviewDialog = ({
	isOpen,
	onClose,
	venueId,
	venueName,
	eligibleBookings,
	onReviewCreated,
}: ReviewDialogProps) => {
	const [rating, setRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [comment, setComment] = useState("");
	const [selectedBookingId, setSelectedBookingId] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleClose = () => {
		if (!isSubmitting) {
			setRating(0);
			setHoverRating(0);
			setComment("");
			setSelectedBookingId("");
			onClose();
		}
	};

	const handleSubmit = async () => {
		if (rating === 0) {
			toast.error("Please select a rating");
			return;
		}

		if (comment.trim().length < 10) {
			toast.error("Please provide a review comment with at least 10 characters");
			return;
		}

		if (!selectedBookingId) {
			toast.error("Please select a booking");
			return;
		}

		try {
			setIsSubmitting(true);

			const reviewData: CreateReviewData = {
				venueId,
				bookingId: selectedBookingId,
				rating,
				comment: comment.trim(),
			};

			await reviewService.createReview(reviewData);

			toast.success("Review submitted successfully!");
			onReviewCreated();
			handleClose();
		} catch (error: any) {
			console.error("Failed to submit review:", error);
			toast.error(error.response?.data?.message || "Failed to submit review");
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderStars = () => {
		return (
			<div className="flex items-center gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<button
						key={star}
						type="button"
						className={cn(
							"transition-colors duration-200 hover:scale-110 transform",
							"focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm",
						)}
						onMouseEnter={() => setHoverRating(star)}
						onMouseLeave={() => setHoverRating(0)}
						onClick={() => setRating(star)}
						disabled={isSubmitting}
					>
						<Star
							className={cn(
								"h-8 w-8 transition-colors duration-200",
								hoverRating >= star || rating >= star
									? "fill-yellow-400 text-yellow-400"
									: "text-gray-300 hover:text-yellow-400",
							)}
						/>
					</button>
				))}
				<span className="ml-2 text-sm text-muted-foreground">
					{rating > 0 && (
						<>
							{rating} star{rating !== 1 ? "s" : ""}
							{rating === 1 && " - Poor"}
							{rating === 2 && " - Fair"}
							{rating === 3 && " - Good"}
							{rating === 4 && " - Very Good"}
							{rating === 5 && " - Excellent"}
						</>
					)}
				</span>
			</div>
		);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Write a Review</DialogTitle>
					<DialogDescription>Share your experience at {venueName} with other users.</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Booking Selection */}
					<div className="space-y-2">
						<Label htmlFor="booking">Select Booking</Label>
						<Select value={selectedBookingId} onValueChange={setSelectedBookingId} disabled={isSubmitting}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Choose a booking..." />
							</SelectTrigger>
							<SelectContent>
								{eligibleBookings.map((booking) => (
									<SelectItem key={booking._id} value={booking._id}>
										{new Date(booking.bookingDate).toLocaleDateString("en-IN", {
											weekday: "long",
											year: "numeric",
											month: "long",
											day: "numeric",
										})}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Rating */}
					<div className="space-y-2">
						<Label>Rating</Label>
						{renderStars()}
					</div>

					{/* Comment */}
					<div className="space-y-2">
						<Label htmlFor="comment">Your Review</Label>
						<Textarea
							id="comment"
							placeholder="Tell others about your experience at this venue..."
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							disabled={isSubmitting}
							className="min-h-[100px] resize-none"
							maxLength={1000}
						/>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>Minimum 10 characters</span>
							<span>{comment.length}/1000</span>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex gap-3 pt-4">
						<Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="flex-1">
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleSubmit}
							disabled={isSubmitting || rating === 0 || comment.trim().length < 10 || !selectedBookingId}
							className="flex-1"
						>
							{isSubmitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Submitting...
								</>
							) : (
								"Submit Review"
							)}
						</Button>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ReviewDialog;
