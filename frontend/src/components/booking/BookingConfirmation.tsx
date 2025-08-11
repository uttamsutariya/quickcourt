import { useState } from "react";
import { CheckCircle, IndianRupee, Calendar, Clock, MapPin, Activity, Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format } from "date-fns";
import bookingService, { type CreateBookingData } from "@/services/booking.service";
import type { Court, AvailableSlot } from "@/services/court.service";
import type { Venue } from "@/services/venue.service";
import { formatSportLabel } from "@/utils/sport-formatter";
import useAuthStore from "@/stores/auth-store";
import { useNavigate } from "react-router-dom";

interface BookingConfirmationProps {
	open: boolean;
	onClose: () => void;
	venue: Venue;
	court: Court;
	date: Date;
	slots: AvailableSlot[];
	onSuccess?: () => void;
}

const BookingConfirmation = ({ open, onClose, venue, court, date, slots, onSuccess }: BookingConfirmationProps) => {
	const { user } = useAuthStore();
	const navigate = useNavigate();
	const [confirming, setConfirming] = useState(false);
	const [agreedToTerms, setAgreedToTerms] = useState(false);
	const [success, setSuccess] = useState(false);
	const [bookingId, setBookingId] = useState<string | null>(null);

	const getTotalAmount = () => {
		return slots.reduce((sum, slot) => sum + slot.price, 0);
	};

	const handleConfirmBooking = async () => {
		if (!agreedToTerms) {
			toast.error("Please agree to the terms and conditions");
			return;
		}

		if (!user) {
			toast.error("Please login to book a court");
			navigate("/auth/login");
			return;
		}

		setConfirming(true);
		try {
			const bookingData: CreateBookingData = {
				venueId: venue._id!,
				courtId: court._id!,
				bookingDate: date.toISOString(),
				startTime: slots[0].startTime,
				endTime: slots[slots.length - 1].endTime,
				numberOfSlots: slots.length,
			};

			const response = await bookingService.createBooking(bookingData);
			setBookingId(response._id);
			setSuccess(true);
			toast.success("Booking confirmed successfully!");

			// Wait a moment before calling onSuccess
			setTimeout(() => {
				onSuccess?.();
				onClose();
				// Navigate to user bookings
				navigate("/user/bookings");
			}, 2000);
		} catch (error: any) {
			console.error("Booking error:", error);
			toast.error(error.response?.data?.message || "Failed to create booking");
		} finally {
			setConfirming(false);
		}
	};

	const handleClose = () => {
		if (!confirming && !success) {
			onClose();
			// Reset state
			setAgreedToTerms(false);
			setSuccess(false);
			setBookingId(null);
		}
	};

	if (success) {
		return (
			<Dialog open={open} onOpenChange={handleClose}>
				<DialogContent className="max-w-md">
					<div className="text-center py-8">
						<CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
						<h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
						<p className="text-muted-foreground mb-4">Your booking has been successfully confirmed</p>
						{bookingId && (
							<p className="text-sm text-muted-foreground">
								Booking ID: <span className="font-mono font-medium">{bookingId}</span>
							</p>
						)}
						<Button onClick={() => navigate("/user/bookings")} className="mt-6">
							View My Bookings
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Confirm Your Booking</DialogTitle>
					<DialogDescription>Please review your booking details before confirming</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					{/* Venue Info */}
					<Card>
						<CardContent className="pt-6">
							<div className="flex items-start gap-4">
								<div className="flex-1 space-y-2">
									<h3 className="font-semibold text-lg">{venue.name}</h3>
									<div className="flex items-center gap-2 text-sm text-muted-foreground">
										<MapPin className="h-4 w-4" />
										<span>
											{venue.address.street}, {venue.address.city}
										</span>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Booking Details */}
					<Card>
						<CardContent className="pt-6 space-y-3">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-1">
									<p className="text-sm text-muted-foreground">Court</p>
									<p className="font-medium flex items-center gap-2">
										{court.name}
										<Badge variant="secondary" className="text-xs">
											<Activity className="h-3 w-3 mr-1" />
											{formatSportLabel(court.sportType)}
										</Badge>
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm text-muted-foreground">Date</p>
									<p className="font-medium flex items-center gap-2">
										<Calendar className="h-4 w-4" />
										{format(date, "EEE, MMM d, yyyy")}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm text-muted-foreground">Time</p>
									<p className="font-medium flex items-center gap-2">
										<Clock className="h-4 w-4" />
										{slots[0].startTime} - {slots[slots.length - 1].endTime}
									</p>
								</div>
								<div className="space-y-1">
									<p className="text-sm text-muted-foreground">Duration</p>
									<p className="font-medium">{slots.length} hour(s)</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Pricing Breakdown */}
					<Card>
						<CardContent className="pt-6 space-y-3">
							<h4 className="font-semibold">Price Breakdown</h4>
							<div className="space-y-2">
								{slots.map((slot, index) => (
									<div key={index} className="flex justify-between text-sm">
										<span className="text-muted-foreground">
											Slot {index + 1} ({slot.startTime} - {slot.endTime})
										</span>
										<span className="font-medium">₹{slot.price}</span>
									</div>
								))}
							</div>
							<Separator />
							<div className="flex justify-between items-center">
								<span className="font-semibold">Total Amount</span>
								<span className="text-xl font-bold flex items-center">
									<IndianRupee className="h-5 w-5" />
									{getTotalAmount()}
								</span>
							</div>
						</CardContent>
					</Card>

					{/* Terms & Conditions */}
					<Card className="border-yellow-500/20 bg-yellow-500/5">
						<CardContent className="pt-6">
							<h4 className="font-semibold mb-3">Important Information</h4>
							<ul className="space-y-2 text-sm text-muted-foreground">
								<li>• Payment will be collected at the venue</li>
								<li>• Cancellation must be done at least 2 hours before the booking time</li>
								<li>• Please arrive 10 minutes before your slot time</li>
								<li>• Bring your own sports equipment if required</li>
							</ul>

							<div className="flex items-start space-x-3 mt-4">
								<Checkbox
									id="terms"
									checked={agreedToTerms}
									onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
									disabled={confirming}
								/>
								<Label htmlFor="terms" className="text-sm cursor-pointer">
									I agree to the terms and conditions and understand the cancellation policy
								</Label>
							</div>
						</CardContent>
					</Card>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={handleClose} disabled={confirming}>
						Cancel
					</Button>
					<Button
						onClick={handleConfirmBooking}
						disabled={confirming || !agreedToTerms}
						className="gradient-primary text-primary-foreground"
					>
						{confirming ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Confirming...
							</>
						) : (
							<>
								Confirm Booking
								<CheckCircle className="ml-2 h-4 w-4" />
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default BookingConfirmation;
