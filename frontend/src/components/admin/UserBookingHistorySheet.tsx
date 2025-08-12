import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar, Clock, MapPin, Activity, IndianRupee } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import adminUserService, { type UserBookingHistory, type UserBooking } from "@/services/admin-user.service";

interface UserBookingHistorySheetProps {
	userId: string | null;
	userName: string;
	isOpen: boolean;
	onClose: () => void;
}

const UserBookingHistorySheet = ({ userId, userName, isOpen, onClose }: UserBookingHistorySheetProps) => {
	const [bookingHistory, setBookingHistory] = useState<UserBookingHistory | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (isOpen && userId) {
			fetchBookingHistory();
		} else if (!isOpen) {
			// Reset booking history when sheet is closed
			setBookingHistory(null);
			setLoading(false);
		}
	}, [isOpen, userId]);

	const fetchBookingHistory = async () => {
		if (!userId) return;

		try {
			setLoading(true);
			const data = await adminUserService.getUserBookingHistory(userId);
			setBookingHistory(data);
		} catch (error: any) {
			console.error("Failed to fetch booking history:", error);
			toast.error(error.message || "Failed to fetch booking history");
		} finally {
			setLoading(false);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status.toLowerCase()) {
			case "confirmed":
				return "bg-blue-500/10 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300";
			case "completed":
				return "bg-green-500/10 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-green-300";
			case "cancelled":
				return "bg-red-500/10 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-300";
			default:
				return "bg-gray-500/10 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-300";
		}
	};

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	const formatDate = (dateString: string) => {
		return format(new Date(dateString), "dd MMM yyyy");
	};

	const formatTime = (timeString: string) => {
		const [hours, minutes] = timeString.split(":");
		const hour = parseInt(hours, 10);
		const ampm = hour >= 12 ? "PM" : "AM";
		const displayHour = hour % 12 || 12;
		return `${displayHour}:${minutes} ${ampm}`;
	};

	const formatAddress = (address: any) => {
		if (typeof address === "string") {
			return address;
		}
		if (address && typeof address === "object") {
			return `${address.city}, ${address.state}`;
		}
		return "Address not available";
	};

	const BookingCard = ({ booking }: { booking: UserBooking }) => (
		<div className="border rounded-xl p-6 space-y-5 bg-card hover:shadow-md transition-shadow duration-200">
			{/* Header with venue name and status */}
			<div className="flex items-start justify-between gap-4">
				<div className="space-y-2 flex-1">
					<h3 className="font-bold text-lg leading-tight">{booking.venueId.name}</h3>
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<MapPin className="h-4 w-4 flex-shrink-0" />
						<span className="truncate">{formatAddress(booking.venueId.address)}</span>
					</div>
				</div>
				<Badge className={getStatusColor(booking.status)} variant="outline">
					{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
				</Badge>
			</div>

			{/* Main booking details */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-muted/50 rounded-lg">
							<Activity className="h-4 w-4 text-muted-foreground" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground uppercase tracking-wide">Court</p>
							<p className="font-semibold">{booking.courtId.name}</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div className="p-2 bg-muted/50 rounded-lg">
							<Calendar className="h-4 w-4 text-muted-foreground" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
							<p className="font-semibold">{formatDate(booking.bookingDate)}</p>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-muted/50 rounded-lg">
							<Clock className="h-4 w-4 text-muted-foreground" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground uppercase tracking-wide">Time</p>
							<p className="font-semibold">
								{formatTime(booking.startTime)} - {formatTime(booking.endTime)}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<div className="p-2 bg-muted/50 rounded-lg">
							<IndianRupee className="h-4 w-4 text-muted-foreground" />
						</div>
						<div>
							<p className="text-xs text-muted-foreground uppercase tracking-wide">Amount</p>
							<p className="font-bold text-primary">{formatCurrency(booking.totalAmount)}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Footer with additional details */}
			<div className="flex items-center justify-between pt-4 border-t border-muted/50">
				<div className="flex items-center gap-4 text-xs text-muted-foreground">
					<span className="px-2 py-1 bg-muted/50 rounded font-medium">{booking.courtId.sportType}</span>
					<span>
						{booking.numberOfSlots} slot{booking.numberOfSlots > 1 ? "s" : ""}
					</span>
				</div>
				<span className="text-xs text-muted-foreground">Booked: {formatDate(booking.createdAt)}</span>
			</div>
		</div>
	);

	const LoadingSkeleton = () => (
		<div className="space-y-6">
			{[...Array(3)].map((_, i) => (
				<div key={i} className="border rounded-xl p-6 space-y-5 bg-card">
					{/* Header */}
					<div className="flex justify-between items-start gap-4">
						<div className="space-y-2 flex-1">
							<Skeleton className="h-6 w-56" />
							<Skeleton className="h-4 w-40" />
						</div>
						<Skeleton className="h-6 w-20" />
					</div>

					{/* Content */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<Skeleton className="h-8 w-8 rounded-lg" />
								<div className="space-y-1">
									<Skeleton className="h-3 w-12" />
									<Skeleton className="h-4 w-24" />
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Skeleton className="h-8 w-8 rounded-lg" />
								<div className="space-y-1">
									<Skeleton className="h-3 w-12" />
									<Skeleton className="h-4 w-28" />
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center gap-3">
								<Skeleton className="h-8 w-8 rounded-lg" />
								<div className="space-y-1">
									<Skeleton className="h-3 w-12" />
									<Skeleton className="h-4 w-32" />
								</div>
							</div>
							<div className="flex items-center gap-3">
								<Skeleton className="h-8 w-8 rounded-lg" />
								<div className="space-y-1">
									<Skeleton className="h-3 w-16" />
									<Skeleton className="h-4 w-20" />
								</div>
							</div>
						</div>
					</div>

					{/* Footer */}
					<div className="flex justify-between items-center pt-4 border-t">
						<div className="flex items-center gap-4">
							<Skeleton className="h-5 w-16" />
							<Skeleton className="h-4 w-12" />
						</div>
						<Skeleton className="h-4 w-24" />
					</div>
				</div>
			))}
		</div>
	);

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			onClose();
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={handleOpenChange}>
			<SheetContent className="w-[50vw] max-w-none p-0">
				<div className="flex flex-col h-full">
					{/* Header Section */}
					<div className="px-8 py-6 border-b bg-muted/20">
						<SheetHeader className="space-y-3">
							<SheetTitle className="text-2xl font-bold">Booking History</SheetTitle>
							<SheetDescription className="text-base">
								All bookings for <span className="font-semibold text-foreground">{userName}</span>
							</SheetDescription>
						</SheetHeader>
					</div>

					{/* Content Section */}
					<div className="flex-1 px-8 py-6">
						<ScrollArea className="h-[calc(100vh-280px)] pr-4">
							{loading ? (
								<div className="space-y-6">
									<LoadingSkeleton />
								</div>
							) : bookingHistory && bookingHistory.bookings.length > 0 ? (
								<div className="space-y-6">
									{bookingHistory.bookings.map((booking) => (
										<BookingCard key={booking._id} booking={booking} />
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-16 text-center">
									<Calendar className="h-16 w-16 text-muted-foreground mb-6" />
									<h3 className="text-xl font-semibold mb-3">No Bookings Found</h3>
									<p className="text-muted-foreground max-w-md text-base leading-relaxed">
										{userName} hasn't made any bookings yet. Once they start booking courts, their history will appear
										here.
									</p>
								</div>
							)}
						</ScrollArea>
					</div>

					{/* Footer Section */}
					{bookingHistory && bookingHistory.bookings.length > 0 && (
						<div className="px-8 py-6 border-t bg-muted/20">
							<div className="flex items-center justify-between">
								<div className="text-sm text-muted-foreground">
									<span className="font-medium">Total bookings:</span> {bookingHistory.bookings.length}
								</div>
								<div className="text-sm text-muted-foreground">
									<span className="font-medium">Total spent:</span>{" "}
									<span className="font-semibold text-foreground">
										{formatCurrency(
											bookingHistory.bookings
												.filter((b) => b.status !== "cancelled")
												.reduce((sum, booking) => sum + booking.totalAmount, 0),
										)}
									</span>
								</div>
							</div>
						</div>
					)}
				</div>
			</SheetContent>
		</Sheet>
	);
};

export default UserBookingHistorySheet;
