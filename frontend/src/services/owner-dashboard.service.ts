import apiClient from "@/lib/api-client";

export interface DashboardStats {
	venues: {
		total: number;
		approved: number;
		pending: number;
		rejected: number;
	};
	bookings: {
		total: number;
		today: number;
		upcoming: number;
		completed: number;
		cancelled: number;
		thisMonth: number;
	};
	courts: {
		totalActive: number;
	};
	earnings: {
		totalRevenue: number;
		adminCommission: number;
		netEarnings: number;
		thisMonthRevenue: number;
		thisMonthNetEarnings: number;
	};
}

class OwnerDashboardService {
	async getDashboardStats(): Promise<DashboardStats> {
		const response = await apiClient.get<{ success: boolean; stats: DashboardStats }>("/bookings/owner/stats");
		return response.data.stats;
	}
}

const ownerDashboardService = new OwnerDashboardService();
export default ownerDashboardService;
