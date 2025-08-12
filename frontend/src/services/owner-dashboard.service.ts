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

export interface BookingTrendData {
	daily: Array<{ date: string; bookings: number }>;
	weekly: Array<{ week: string; date: string; bookings: number }>;
	monthly: Array<{ month: string; date: string; bookings: number }>;
}

export interface EarningsData {
	daily: Array<{ date: string; grossEarnings: number; netEarnings: number }>;
	monthly: Array<{ month: string; date: string; grossEarnings: number; netEarnings: number }>;
}

export interface PeakHoursData {
	hour: string;
	bookings: number;
}

export interface ChartData {
	bookingTrends: BookingTrendData;
	earningsSummary: EarningsData;
	peakHours: PeakHoursData[];
}

class OwnerDashboardService {
	async getDashboardStats(): Promise<DashboardStats> {
		const response = await apiClient.get<{ success: boolean; stats: DashboardStats }>("/bookings/owner/stats");
		return response.data.stats;
	}

	async getChartData(): Promise<ChartData> {
		const response = await apiClient.get<{ success: boolean; charts: ChartData }>("/bookings/owner/charts");
		return response.data.charts;
	}
}

const ownerDashboardService = new OwnerDashboardService();
export default ownerDashboardService;
