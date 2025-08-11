import { Calendar, Clock, MapPin, User, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { OwnerBooking } from "@/services/owner-booking.service";
import { BookingStatus } from "@/types/enums";
import { cn } from "@/lib/utils";

interface BookingCardProps {
	booking: OwnerBooking;
	onClick?: () => void;
}

const BookingCard = ({ booking, onClick }: BookingCardProps) => {
	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		const today = new Date();
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		// Reset time for comparison
		const bookingDate = new Date(date);
		bookingDate.setHours(0, 0, 0, 0);
		today.setHours(0, 0, 0, 0);
		tomorrow.setHours(0, 0, 0, 0);

		if (bookingDate.getTime() === today.getTime()) {
			return "Today";
		} else if (bookingDate.getTime() === tomorrow.getTime()) {
			return "Tomorrow";
		} else {
			return date.toLocaleDateString("en-IN", {
				day: "numeric",
				month: "short",
				year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
			});
		}
	};

	const formatTime = (startTime: string, endTime: string) => {
		const formatTimeString = (time: string) => {
			const [hours, minutes] = time.split(":");
			const hour = parseInt(hours);
			const ampm = hour >= 12 ? "PM" : "AM";
			const formattedHour = hour % 12 || 12;
			return `${formattedHour}:${minutes} ${ampm}`;
		};

		return `${formatTimeString(startTime)} - ${formatTimeString(endTime)}`;
	};

	const getStatusColor = (status: BookingStatus) => {
		switch (status) {
			case BookingStatus.CONFIRMED:
				return "bg-green-100 text-green-800 border-green-200";
			case BookingStatus.COMPLETED:
				return "bg-blue-100 text-blue-800 border-blue-200";
			case BookingStatus.CANCELLED:
				return "bg-red-100 text-red-800 border-red-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusLabel = (status: BookingStatus) => {
		switch (status) {
			case BookingStatus.CONFIRMED:
				return "Confirmed";
			case BookingStatus.COMPLETED:
				return "Completed";
			case BookingStatus.CANCELLED:
				return "Cancelled";
			default:
				return status;
		}
	};

	const isToday = () => {
		const today = new Date();
		const bookingDate = new Date(booking.bookingDate);
		return (
			bookingDate.getDate() === today.getDate() &&
			bookingDate.getMonth() === today.getMonth() &&
			bookingDate.getFullYear() === today.getFullYear()
		);
	};

	return (
		<div
			className={cn(
				"bg-card dark:bg-zinc-950 border rounded-lg shadow-sm transition-all duration-200 hover:shadow-md cursor-pointer",
				isToday() && "ring-2 ring-primary ring-opacity-50",
				booking.status === BookingStatus.CANCELLED && "opacity-75",
			)}
			onClick={onClick}
		>
			<div className="p-4 space-y-3">
				{/* User Name */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<User className="h-4 w-4 text-muted-foreground" />
						<span className="font-medium text-sm">{booking.userId.name}</span>
					</div>
					<Badge className={cn("text-xs", getStatusColor(booking.status))}>{getStatusLabel(booking.status)}</Badge>
				</div>

				{/* Venue */}
				<div className="flex items-center gap-2">
					<MapPin className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm text-muted-foreground truncate">{booking.venueId.name}</span>
				</div>

				{/* Court & Sport */}
				<div className="flex items-center gap-2">
					<Activity className="h-4 w-4 text-muted-foreground" />
					<span className="text-sm">
						{booking.courtId.name} • {booking.courtId.sportType}
					</span>
				</div>

				{/* Date & Time */}
				<div className="flex items-center justify-between pt-2 border-t">
					<div className="flex items-center gap-2">
						<Calendar className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm font-medium">{formatDate(booking.bookingDate)}</span>
					</div>
					<div className="flex items-center gap-2">
						<Clock className="h-3.5 w-3.5 text-muted-foreground" />
						<span className="text-xs text-muted-foreground">{formatTime(booking.startTime, booking.endTime)}</span>
					</div>
				</div>

				{/* Today Indicator */}
				{isToday() && (
					<div className="flex items-center justify-center pt-2">
						<Badge variant="default" className="text-xs">
							Today's Booking
						</Badge>
					</div>
				)}
			</div>
		</div>
	);
};

export default BookingCard;
