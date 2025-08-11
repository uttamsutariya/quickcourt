import apiClient from "@/lib/api-client";
import { BookingStatus, SlotDuration } from "@/types/enums";

// Booking interfaces
export interface CreateBookingData {
	venueId: string;
	courtId: string;
	bookingDate: string;
	startTime: string;
	endTime: string;
	numberOfSlots: number;
}

export interface Booking {
	_id: string;
	userId: {
		_id: string;
		name: string;
		email: string;
	};
	venueId: {
		_id: string;
		name: string;
		address: {
			street: string;
			city: string;
			state: string;
			zipCode: string;
			country: string;
		};
		images?: string[];
	};
	courtId: {
		_id: string;
		name: string;
		sportType: string;
	};
	bookingDate: string;
	startTime: string;
	endTime: string;
	numberOfSlots: number;
	slotDuration: SlotDuration;
	totalAmount: number;
	status: BookingStatus;
	paymentSimulated: boolean;
	cancellationReason?: string;
	cancelledAt?: string;
	createdAt: string;
	updatedAt: string;
}

export interface BookingFilters {
	status?: BookingStatus;
	upcoming?: boolean;
	past?: boolean;
	courtId?: string;
	date?: string;
}

// Booking service
class BookingService {
	// Create a new booking
	async createBooking(bookingData: CreateBookingData): Promise<Booking> {
		const response = await apiClient.post("/bookings", bookingData);
		return response.data.booking;
	}

	// Get user's bookings
	async getUserBookings(filters?: BookingFilters): Promise<Booking[]> {
		const response = await apiClient.get("/bookings/user", { params: filters });
		return response.data.bookings;
	}

	// Get venue bookings (for facility owners)
	async getVenueBookings(venueId: string, filters?: BookingFilters): Promise<Booking[]> {
		const response = await apiClient.get(`/bookings/venue/${venueId}`, { params: filters });
		return response.data.bookings;
	}

	// Get booking details
	async getBookingDetails(bookingId: string): Promise<Booking> {
		const response = await apiClient.get(`/bookings/${bookingId}`);
		return response.data.booking;
	}

	// Cancel booking
	async cancelBooking(bookingId: string, reason?: string): Promise<void> {
		await apiClient.patch(`/bookings/${bookingId}/cancel`, { reason });
	}

	// Helper methods

	// Check if booking can be cancelled (2 hours before start)
	canCancelBooking(booking: Booking): boolean {
		if (booking.status !== BookingStatus.CONFIRMED) {
			return false;
		}

		const bookingDateTime = new Date(`${booking.bookingDate} ${booking.startTime}`);
		const now = new Date();
		const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

		return hoursUntilBooking >= 2;
	}

	// Format booking time for display
	formatBookingTime(booking: Booking): string {
		const date = new Date(booking.bookingDate);
		const dateStr = date.toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			year: "numeric",
		});

		return `${dateStr}, ${booking.startTime} - ${booking.endTime}`;
	}

	// Get booking status color
	getBookingStatusColor(status: BookingStatus): string {
		switch (status) {
			case BookingStatus.CONFIRMED:
				return "blue";
			case BookingStatus.COMPLETED:
				return "green";
			case BookingStatus.CANCELLED:
				return "red";
			default:
				return "gray";
		}
	}

	// Calculate booking duration in hours
	getBookingDuration(booking: Booking): number {
		return booking.numberOfSlots * booking.slotDuration;
	}

	// Group bookings by date
	groupBookingsByDate(bookings: Booking[]): Map<string, Booking[]> {
		const grouped = new Map<string, Booking[]>();

		bookings.forEach((booking) => {
			const date = booking.bookingDate;
			if (!grouped.has(date)) {
				grouped.set(date, []);
			}
			grouped.get(date)!.push(booking);
		});

		// Sort bookings within each date by start time
		grouped.forEach((bookings) => {
			bookings.sort((a, b) => a.startTime.localeCompare(b.startTime));
		});

		return grouped;
	}

	// Check if booking is upcoming
	isUpcomingBooking(booking: Booking): boolean {
		const bookingDateTime = new Date(`${booking.bookingDate} ${booking.startTime}`);
		return bookingDateTime > new Date() && booking.status === BookingStatus.CONFIRMED;
	}

	// Check if booking is past
	isPastBooking(booking: Booking): boolean {
		const bookingDateTime = new Date(`${booking.bookingDate} ${booking.endTime}`);
		return bookingDateTime < new Date() || booking.status === BookingStatus.COMPLETED;
	}
}

export default new BookingService();
