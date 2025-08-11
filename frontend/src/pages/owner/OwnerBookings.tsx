import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Filter, Calendar, Clock, XCircle, CheckCircle, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import BookingCard from "@/components/booking/BookingCard";
import ownerBookingService, { type OwnerBooking, type OwnerBookingFilters } from "@/services/owner-booking.service";
import { BookingStatus } from "@/types/enums";
import { toast } from "sonner";

const OwnerBookings = () => {
	const navigate = useNavigate();
	const [bookings, setBookings] = useState<OwnerBooking[]>([]);
	const [venues, setVenues] = useState<Array<{ _id: string; name: string }>>([]);
	const [loading, setLoading] = useState(true);
	const [filters, setFilters] = useState<OwnerBookingFilters>({
		status: "all",
		timeFilter: "all",
		venueId: undefined,
	});

	useEffect(() => {
		fetchBookings();
	}, [filters]);

	const fetchBookings = async () => {
		try {
			setLoading(true);
			const response = await ownerBookingService.getOwnerBookings(filters);
			setBookings(response.bookings);
			setVenues(response.venues);
		} catch (error: any) {
			console.error("Error fetching bookings:", error);
			toast.error(error.response?.data?.message || "Failed to fetch bookings");
		} finally {
			setLoading(false);
		}
	};

	const getStats = () => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const todayBookings = bookings.filter((b) => {
			const bookingDate = new Date(b.bookingDate);
			bookingDate.setHours(0, 0, 0, 0);
			return bookingDate.getTime() === today.getTime() && b.status === BookingStatus.CONFIRMED;
		});

		const upcomingBookings = bookings.filter((b) => {
			const bookingDate = new Date(b.bookingDate);
			return bookingDate >= tomorrow && b.status === BookingStatus.CONFIRMED;
		});

		const completedBookings = bookings.filter((b) => b.status === BookingStatus.COMPLETED);
		const cancelledBookings = bookings.filter((b) => b.status === BookingStatus.CANCELLED);

		return {
			today: todayBookings.length,
			upcoming: upcomingBookings.length,
			completed: completedBookings.length,
			cancelled: cancelledBookings.length,
		};
	};

	const stats = getStats();

	const handleFilterChange = (key: keyof OwnerBookingFilters, value: any) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const clearFilters = () => {
		setFilters({
			status: "all",
			timeFilter: "all",
			venueId: undefined,
		});
	};

	const hasActiveFilters = filters.status !== "all" || filters.timeFilter !== "all" || filters.venueId;

	return (
		<div className="container mx-auto p-6 max-w-7xl">
			{/* Header */}
			<div className="mb-6">
				<Button variant="ghost" onClick={() => navigate("/owner/dashboard")} className="mb-4">
					<ChevronLeft className="mr-2 h-4 w-4" />
					Back to Dashboard
				</Button>
				<div className="flex items-center justify-between">
					<div>
						<h1 className="text-3xl font-bold">Bookings Overview</h1>
						<p className="text-muted-foreground mt-2">Manage all bookings across your venues</p>
					</div>
					{hasActiveFilters && (
						<Button variant="outline" onClick={clearFilters}>
							Clear Filters
						</Button>
					)}
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				<div className="bg-card dark:bg-zinc-950 border rounded-lg shadow-sm">
					<div className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Today</p>
								<p className="text-2xl font-bold">{stats.today}</p>
							</div>
							<Calendar className="h-8 w-8 text-primary opacity-20" />
						</div>
					</div>
				</div>
				<div className="bg-card dark:bg-zinc-950 border rounded-lg shadow-sm">
					<div className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Upcoming</p>
								<p className="text-2xl font-bold">{stats.upcoming}</p>
							</div>
							<Clock className="h-8 w-8 text-blue-500 opacity-20" />
						</div>
					</div>
				</div>
				<div className="bg-card dark:bg-zinc-950 border rounded-lg shadow-sm">
					<div className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Completed</p>
								<p className="text-2xl font-bold">{stats.completed}</p>
							</div>
							<CheckCircle className="h-8 w-8 text-green-500 opacity-20" />
						</div>
					</div>
				</div>
				<div className="bg-card dark:bg-zinc-950 border rounded-lg shadow-sm">
					<div className="p-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-muted-foreground">Cancelled</p>
								<p className="text-2xl font-bold">{stats.cancelled}</p>
							</div>
							<XCircle className="h-8 w-8 text-red-500 opacity-20" />
						</div>
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-card dark:bg-zinc-950 border rounded-lg shadow-sm mb-6">
				<div className="p-6 pb-4">
					<h3 className="text-lg font-semibold flex items-center gap-2">
						<Filter className="h-5 w-5" />
						Filters
					</h3>
				</div>
				<div className="px-6 pb-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Time Filter */}
						<div className="space-y-2">
							<Label>Time Period</Label>
							<RadioGroup
								value={filters.timeFilter}
								onValueChange={(value) => handleFilterChange("timeFilter", value)}
								className="flex flex-wrap gap-2"
							>
								<div className="flex items-center">
									<RadioGroupItem value="all" id="time-all" className="sr-only" />
									<Label
										htmlFor="time-all"
										className={`px-3 py-1 rounded-full border cursor-pointer transition-colors ${
											filters.timeFilter === "all"
												? "bg-primary text-primary-foreground border-primary"
												: "bg-background hover:bg-muted"
										}`}
									>
										All
									</Label>
								</div>
								<div className="flex items-center">
									<RadioGroupItem value="today" id="time-today" className="sr-only" />
									<Label
										htmlFor="time-today"
										className={`px-3 py-1 rounded-full border cursor-pointer transition-colors ${
											filters.timeFilter === "today"
												? "bg-primary text-primary-foreground border-primary"
												: "bg-background hover:bg-muted"
										}`}
									>
										Today
									</Label>
								</div>
								<div className="flex items-center">
									<RadioGroupItem value="upcoming" id="time-upcoming" className="sr-only" />
									<Label
										htmlFor="time-upcoming"
										className={`px-3 py-1 rounded-full border cursor-pointer transition-colors ${
											filters.timeFilter === "upcoming"
												? "bg-primary text-primary-foreground border-primary"
												: "bg-background hover:bg-muted"
										}`}
									>
										Upcoming
									</Label>
								</div>
								<div className="flex items-center">
									<RadioGroupItem value="past" id="time-past" className="sr-only" />
									<Label
										htmlFor="time-past"
										className={`px-3 py-1 rounded-full border cursor-pointer transition-colors ${
											filters.timeFilter === "past"
												? "bg-primary text-primary-foreground border-primary"
												: "bg-background hover:bg-muted"
										}`}
									>
										Past
									</Label>
								</div>
							</RadioGroup>
						</div>

						{/* Status Filter */}
						<div className="space-y-2">
							<Label>Status</Label>
							<Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
								<SelectTrigger>
									<SelectValue placeholder="All Statuses" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Statuses</SelectItem>
									<SelectItem value={BookingStatus.CONFIRMED}>Confirmed</SelectItem>
									<SelectItem value={BookingStatus.COMPLETED}>Completed</SelectItem>
									<SelectItem value={BookingStatus.CANCELLED}>Cancelled</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Venue Filter */}
						<div className="space-y-2">
							<Label>Venue</Label>
							<Select
								value={filters.venueId || "all"}
								onValueChange={(value) => handleFilterChange("venueId", value === "all" ? undefined : value)}
							>
								<SelectTrigger>
									<SelectValue placeholder="All Venues" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Venues</SelectItem>
									{venues.map((venue) => (
										<SelectItem key={venue._id} value={venue._id}>
											{venue.name}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
			</div>

			{/* Bookings Grid */}
			{loading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{Array.from({ length: 8 }).map((_, index) => (
						<div key={index} className="bg-card dark:bg-zinc-950 border rounded-lg shadow-sm">
							<div className="p-4">
								<Skeleton className="h-4 w-3/4 mb-3" />
								<Skeleton className="h-3 w-full mb-2" />
								<Skeleton className="h-3 w-full mb-2" />
								<Skeleton className="h-3 w-2/3" />
							</div>
						</div>
					))}
				</div>
			) : bookings.length === 0 ? (
				<div className="bg-card dark:bg-zinc-950 border rounded-lg shadow-sm">
					<div className="p-12 text-center">
						<Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-semibold mb-2">No bookings found</h3>
						<p className="text-muted-foreground">
							{hasActiveFilters ? "Try adjusting your filters to see more bookings" : "You don't have any bookings yet"}
						</p>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{bookings.map((booking) => (
						<BookingCard
							key={booking._id}
							booking={booking}
							onClick={() => {
								// Future: Open booking details modal
								console.log("Booking clicked:", booking._id);
							}}
						/>
					))}
				</div>
			)}

			{/* Results Count */}
			{!loading && bookings.length > 0 && (
				<div className="mt-6 text-center text-sm text-muted-foreground">
					Showing {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
				</div>
			)}
		</div>
	);
};

export default OwnerBookings;
