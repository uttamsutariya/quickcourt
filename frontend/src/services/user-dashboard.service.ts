import apiClient from "@/lib/api-client";
import type { Booking } from "./booking.service";

export interface UserDashboardStats {
	totalBookings: number;
	venuesVisited: number;
	upcomingBookings: number;
	completedBookings: number;
	cancelledBookings: number;
	totalAmountSpent: number;
	memberSince: string;
	recentBookings: Booking[];
}

class UserDashboardService {
	async getDashboardStats(): Promise<UserDashboardStats> {
		const response = await apiClient.get<{ success: boolean; stats: UserDashboardStats }>("/bookings/user/stats");
		return response.data.stats;
	}
}

const userDashboardService = new UserDashboardService();
export default userDashboardService;
