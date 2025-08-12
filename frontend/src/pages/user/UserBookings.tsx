import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Activity, AlertCircle, IndianRupee, Loader2, Hash, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format, isPast, differenceInHours } from "date-fns";
import bookingService, { type Booking } from "@/services/booking.service";
import { formatSportLabel } from "@/utils/sport-formatter";
import { BookingStatus } from "@/types/enums";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

const UserBookings = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("upcoming");
	const [bookings, setBookings] = useState<Booking[]>([]);
	const [loading, setLoading] = useState(true);
	const [cancelling, setCancelling] = useState<string | null>(null);
	const [cancelDialog, setCancelDialog] = useState<Booking | null>(null);

	useEffect(() => {
		fetchBookings();
	}, []);

	const fetchBookings = async () => {
		try {
			setLoading(true);
			const data = await bookingService.getUserBookings();
			// Sort by newest first
			const sortedBookings = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
			setBookings(sortedBookings);
		} catch (error) {
			console.error("Error fetching bookings:", error);
			toast.error("Failed to fetch bookings");
		} finally {
			setLoading(false);
		}
	};

	const handleCancelBooking = async () => {
		if (!cancelDialog) return;

		setCancelling(cancelDialog._id);
		try {
			await bookingService.cancelBooking(cancelDialog._id, "User requested cancellation");
			toast.success("Booking cancelled successfully");
			setCancelDialog(null);
			fetchBookings(); // Refresh bookings
		} catch (error: any) {
			console.error("Error cancelling booking:", error);
			toast.error(error.response?.data?.message || "Failed to cancel booking");
		} finally {
			setCancelling(null);
		}
	};

	const canCancelBooking = (booking: Booking) => {
		const bookingDateTime = new Date(`${booking.bookingDate.split("T")[0]}T${booking.startTime}`);
		const hoursUntilBooking = differenceInHours(bookingDateTime, new Date());
		return hoursUntilBooking >= 2 && booking.status === BookingStatus.CONFIRMED;
	};

	const getStatusBadge = (status: BookingStatus) => {
		switch (status) {
			case BookingStatus.CONFIRMED:
				return (
					<Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs h-5 px-1.5">Confirmed</Badge>
				);
			case BookingStatus.COMPLETED:
				return (
					<Badge variant="secondary" className="text-xs h-5 px-1.5">
						Completed
					</Badge>
				);
			case BookingStatus.CANCELLED:
				return (
					<Badge variant="destructive" className="text-xs h-5 px-1.5">
						Cancelled
					</Badge>
				);
			default:
				return null;
		}
	};

	// Filter bookings by status
	const upcomingBookings = bookings.filter((b) => {
		const bookingDate = new Date(`${b.bookingDate.split("T")[0]}T${b.startTime}`);
		return b.status === BookingStatus.CONFIRMED && !isPast(bookingDate);
	});

	const pastBookings = bookings.filter((b) => {
		const bookingDate = new Date(`${b.bookingDate.split("T")[0]}T${b.startTime}`);
		return b.status === BookingStatus.COMPLETED || (b.status === BookingStatus.CONFIRMED && isPast(bookingDate));
	});

	const cancelledBookings = bookings.filter((b) => b.status === BookingStatus.CANCELLED);

	const EmptyState = ({ type }: { type: string }) => (
		<div className="flex flex-col items-center justify-center py-12 text-center">
			<div className="p-4 rounded-full bg-muted mb-4">
				<Calendar className="h-8 w-8 text-muted-foreground" />
			</div>
			<h3 className="text-lg font-semibold mb-2">No {type} bookings</h3>
			<p className="text-muted-foreground mb-6 max-w-sm">
				{type === "upcoming"
					? "You don't have any upcoming bookings. Start by browsing available venues."
					: type === "past"
					? "You haven't completed any bookings yet."
					: "You haven't cancelled any bookings."}
			</p>
			{type !== "cancelled" && <Button onClick={() => navigate("/venues")}>Browse Venues</Button>}
		</div>
	);

	const BookingCard = ({ booking }: { booking: Booking }) => (
		<Card className="h-full hover:shadow-md transition-shadow">
			<CardHeader className="pb-3">
				<div className="space-y-1">
					<div className="flex items-start justify-between">
						<CardTitle className="text-base leading-tight line-clamp-1">{booking.venueId.name}</CardTitle>
						{getStatusBadge(booking.status)}
					</div>
					<div className="flex items-center justify-between">
						<CardDescription className="text-xs flex items-center gap-1">
							<MapPin className="h-3 w-3" />
							{typeof booking.venueId.address === "string"
								? booking.venueId.address
								: booking.venueId.address?.city || "Location not available"}
						</CardDescription>
						<Badge variant="outline" className="text-xs h-5 px-1">
							<Hash className="h-2.5 w-2.5 mr-0.5" />
							{booking._id.slice(-6).toUpperCase()}
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-0">
				<div className="space-y-2 text-xs">
					{/* Date and Time Row */}
					<div className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
						<div className="flex items-center gap-1.5">
							<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
							<span className="font-medium">{format(new Date(booking.bookingDate), "MMM d")}</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Clock className="h-3.5 w-3.5 text-muted-foreground" />
							<span>
								{booking.startTime} - {booking.endTime}
							</span>
						</div>
					</div>

					{/* Sport and Court Row */}
					<div className="flex items-center justify-between px-1">
						<div className="flex items-center gap-1.5">
							<Activity className="h-3.5 w-3.5 text-muted-foreground" />
							<span>{formatSportLabel(booking.courtId.sportType)}</span>
						</div>
						<div className="flex items-center gap-1.5">
							<Building2 className="h-3.5 w-3.5 text-muted-foreground" />
							<span>{booking.courtId.name}</span>
						</div>
					</div>

					{/* Price Row */}
					<div className="flex items-center justify-between pt-1 border-t">
						<span className="text-muted-foreground">{booking.numberOfSlots} hour(s)</span>
						<span className="font-semibold text-sm flex items-center">
							<IndianRupee className="h-3.5 w-3.5" />
							{booking.totalAmount}
						</span>
					</div>
				</div>

				{booking.status === BookingStatus.CONFIRMED &&
					!isPast(new Date(`${booking.bookingDate.split("T")[0]}T${booking.startTime}`)) && (
						<div className="mt-3">
							{canCancelBooking(booking) ? (
								<Button
									size="sm"
									variant="destructive"
									onClick={() => setCancelDialog(booking)}
									className="w-full h-7 text-xs cursor-pointer"
								>
									Cancel Booking
								</Button>
							) : (
								<p className="text-xs text-center text-muted-foreground">Cannot cancel (less than 2 hours)</p>
							)}
						</div>
					)}

				{booking.status === BookingStatus.CANCELLED && booking.cancellationReason && (
					<div className="mt-3 p-1.5 bg-destructive/5 rounded text-xs">
						<p className="text-muted-foreground">
							<span className="font-medium">Reason:</span> {booking.cancellationReason}
						</p>
						{booking.cancelledAt && (
							<p className="text-muted-foreground mt-0.5">
								{format(new Date(booking.cancelledAt), "MMM d 'at' h:mm a")}
							</p>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);

	if (loading) {
		return (
			<div className="flex items-center justify-center py-12">
				<Loader2 className="h-8 w-8 animate-spin" />
			</div>
		);
	}

	return (
		<div className="space-y-6 my-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold">My Bookings</h1>
				<p className="text-muted-foreground mt-2">Manage your court bookings and view history</p>
			</div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full max-w-md grid-cols-3">
					<TabsTrigger value="upcoming">
						Upcoming {upcomingBookings.length > 0 && `(${upcomingBookings.length})`}
					</TabsTrigger>
					<TabsTrigger value="past">Past {pastBookings.length > 0 && `(${pastBookings.length})`}</TabsTrigger>
					<TabsTrigger value="cancelled">
						Cancelled {cancelledBookings.length > 0 && `(${cancelledBookings.length})`}
					</TabsTrigger>
				</TabsList>

				{/* Upcoming Bookings */}
				<TabsContent value="upcoming">
					{upcomingBookings.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{upcomingBookings.map((booking) => (
								<BookingCard key={booking._id} booking={booking} />
							))}
						</div>
					) : (
						<EmptyState type="upcoming" />
					)}
				</TabsContent>

				{/* Past Bookings */}
				<TabsContent value="past">
					{pastBookings.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{pastBookings.map((booking) => (
								<BookingCard key={booking._id} booking={booking} />
							))}
						</div>
					) : (
						<EmptyState type="past" />
					)}
				</TabsContent>

				{/* Cancelled Bookings */}
				<TabsContent value="cancelled">
					{cancelledBookings.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
							{cancelledBookings.map((booking) => (
								<BookingCard key={booking._id} booking={booking} />
							))}
						</div>
					) : (
						<EmptyState type="cancelled" />
					)}
				</TabsContent>
			</Tabs>

			{/* Info Card */}
			<Card className="bg-muted/50">
				<CardContent className="p-6">
					<h3 className="font-semibold mb-2 flex items-center gap-2">
						<AlertCircle className="h-5 w-5 text-primary" />
						Booking Policy
					</h3>
					<ul className="text-sm text-muted-foreground space-y-1">
						<li>• Bookings can be cancelled up to 2 hours before the scheduled time</li>
						<li>• Full refund for cancellations made 24 hours in advance</li>
						<li>• 50% refund for cancellations made 2-24 hours in advance</li>
						<li>• No refund for last-minute cancellations (less than 2 hours)</li>
					</ul>
				</CardContent>
			</Card>

			{/* Cancel Confirmation Dialog */}
			<Dialog open={!!cancelDialog} onOpenChange={() => setCancelDialog(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Cancel Booking</DialogTitle>
						<DialogDescription>
							Are you sure you want to cancel this booking? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					{cancelDialog && (
						<div className="space-y-2 text-sm">
							<p>
								<strong>Venue:</strong> {cancelDialog.venueId.name}
							</p>
							<p>
								<strong>Court:</strong> {cancelDialog.courtId.name}
							</p>
							<p>
								<strong>Date:</strong> {format(new Date(cancelDialog.bookingDate), "EEE, MMM d, yyyy")}
							</p>
							<p>
								<strong>Time:</strong> {cancelDialog.startTime} - {cancelDialog.endTime}
							</p>
						</div>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setCancelDialog(null)}
							disabled={!!cancelling}
							className="cursor-pointer"
						>
							Keep Booking
						</Button>
						<Button
							variant="destructive"
							onClick={handleCancelBooking}
							disabled={!!cancelling}
							className="cursor-pointer"
						>
							{cancelling ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Cancelling...
								</>
							) : (
								"Cancel Booking"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default UserBookings;
