import apiClient from "@/lib/api-client";

export interface User {
	_id: string;
	name: string;
	email: string;
	role: string;
	isActive: boolean;
	phoneNumber?: string;
	createdAt: string;
	updatedAt: string;
}

export interface UserBooking {
	_id: string;
	bookingDate: string;
	startTime: string;
	endTime: string;
	numberOfSlots: number;
	totalAmount: number;
	status: string;
	createdAt: string;
	venueId: {
		_id: string;
		name: string;
		address:
			| {
					street: string;
					city: string;
					state: string;
					zipCode: string;
					country: string;
			  }
			| string; // Can be either object or string depending on population
	};
	courtId: {
		_id: string;
		name: string;
		sportType: string;
	};
}

export interface UserBookingHistory {
	user: {
		_id: string;
		name: string;
		email: string;
		role: string;
	};
	bookings: UserBooking[];
}

export interface UsersResponse {
	success: boolean;
	users: User[];
	pagination: {
		total: number;
		page: number;
		limit: number;
		pages: number;
	};
}

export interface UserFilters {
	role?: string;
	status?: string;
	search?: string;
	page?: number;
	limit?: number;
}

class AdminUserService {
	/**
	 * Get all users with optional filters
	 */
	async getUsers(filters: UserFilters = {}): Promise<UsersResponse> {
		const params = new URLSearchParams();

		if (filters.role) params.append("role", filters.role);
		if (filters.status) params.append("status", filters.status);
		if (filters.search) params.append("search", filters.search);
		if (filters.page) params.append("page", filters.page.toString());
		if (filters.limit) params.append("limit", filters.limit.toString());

		const response = await apiClient.get(`/admin/users?${params.toString()}`);
		return response.data;
	}

	/**
	 * Toggle user active status (ban/unban)
	 */
	async toggleUserStatus(userId: string): Promise<{ success: boolean; message: string; user: User }> {
		const response = await apiClient.put(`/admin/users/${userId}/toggle-status`);
		return response.data;
	}

	/**
	 * Get user booking history
	 */
	async getUserBookingHistory(userId: string): Promise<UserBookingHistory> {
		const response = await apiClient.get(`/admin/users/${userId}/bookings`);
		return response.data;
	}
}

const adminUserService = new AdminUserService();
export default adminUserService;
