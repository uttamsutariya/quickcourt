import apiClient from "@/lib/api-client";
import { BookingStatus } from "@/types/enums";

export interface OwnerBooking {
	_id: string;
	userId: {
		_id: string;
		name: string;
		email: string;
		phoneNumber?: string;
	};
	venueId: {
		_id: string;
		name: string;
		address: any;
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
	slotDuration: number;
	totalAmount: number;
	status: BookingStatus;
	cancellationReason?: string;
	cancelledAt?: string;
	completedAt?: string;
	paymentSimulated: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface OwnerBookingsResponse {
	success: boolean;
	bookings: OwnerBooking[];
	venues: Array<{
		_id: string;
		name: string;
	}>;
}

export interface OwnerBookingFilters {
	status?: BookingStatus | "all";
	timeFilter?: "upcoming" | "past" | "today" | "all";
	venueId?: string;
}

class OwnerBookingService {
	async getOwnerBookings(filters?: OwnerBookingFilters): Promise<OwnerBookingsResponse> {
		const params = new URLSearchParams();

		if (filters?.status) {
			params.append("status", filters.status);
		}

		if (filters?.timeFilter && filters.timeFilter !== "all") {
			params.append("timeFilter", filters.timeFilter);
		}

		if (filters?.venueId) {
			params.append("venueId", filters.venueId);
		}

		const response = await apiClient.get<OwnerBookingsResponse>(`/bookings/owner?${params.toString()}`);
		return response.data;
	}
}

const ownerBookingService = new OwnerBookingService();
export { ownerBookingService };
export default ownerBookingService;
