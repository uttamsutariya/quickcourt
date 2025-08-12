import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Building2,
	Users,
	Calendar,
	Activity,
	Clock,
	CheckCircle,
	XCircle,
	Eye,
	UserCheck,
	AlertCircle,
	IndianRupee,
	TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";
import EarningsChart from "@/components/admin/EarningsChart";
import BookingActivityChart from "@/components/admin/BookingActivityChart";

interface DailyEarning {
	date: string;
	earnings: number;
}

interface DailyBooking {
	date: string;
	bookings: number;
}

interface AdminStats {
	venues: {
		total: number;
		pending: number;
		approved: number;
		rejected: number;
	};
	users: {
		totalUsers: number;
		totalFacilityOwners: number;
	};
	bookings: {
		total: number;
	};
	courts: {
		totalActive: number;
	};
	earnings: {
		totalRevenue: number;
		adminEarnings: number;
		thisMonthRevenue: number;
		thisMonthEarnings: number;
	};
	charts: {
		dailyEarnings: DailyEarning[];
		dailyBookings: DailyBooking[];
	};
}

const AdminDashboard = () => {
	const navigate = useNavigate();
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchStats();
	}, []);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	const fetchStats = async () => {
		try {
			setLoading(true);
			const response = await apiClient.get("/admin/stats");
			setStats(response.data.stats);
		} catch (error: any) {
			console.error("Failed to fetch admin stats:", error);
			toast.error("Failed to load dashboard statistics");
			// Set default data
			setStats({
				venues: {
					total: 0,
					pending: 0,
					approved: 0,
					rejected: 0,
				},
				users: {
					totalUsers: 0,
					totalFacilityOwners: 0,
				},
				bookings: {
					total: 0,
				},
				courts: {
					totalActive: 0,
				},
				earnings: {
					totalRevenue: 0,
					adminEarnings: 0,
					thisMonthRevenue: 0,
					thisMonthEarnings: 0,
				},
				charts: {
					dailyEarnings: [],
					dailyBookings: [],
				},
			});
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<div className="mb-8">
					<Skeleton className="h-9 w-64" />
					<Skeleton className="h-5 w-48 mt-2" />
				</div>
				<div className="grid gap-6 lg:grid-cols-2 mb-6">
					<Skeleton className="h-52 w-full rounded-lg" />
					<Skeleton className="h-52 w-full rounded-lg" />
				</div>
				<div className="grid gap-6 lg:grid-cols-2 mb-6">
					<Skeleton className="h-28 w-full rounded-lg" />
					<Skeleton className="h-28 w-full rounded-lg" />
				</div>
			</div>
		);
	}

	if (!stats) {
		return (
			<div className="container mx-auto p-6 max-w-7xl">
				<div className="text-center py-12">
					<AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<h3 className="text-lg font-semibold mb-2">Unable to load dashboard</h3>
					<p className="text-muted-foreground mb-4">There was an error loading your dashboard statistics.</p>
					<Button onClick={fetchStats}>Retry</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-7xl">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				<p className="text-muted-foreground mt-2">Monitor and manage platform operations</p>
			</div>

			{/* Earnings Section - Top Priority */}
			<div className="grid gap-6 lg:grid-cols-3 mb-6">
				{/* Total Earnings Card */}
				<div className="bg-card border rounded-xl p-6 hover:shadow-sm transition-shadow">
					<div className="flex items-center justify-between mb-4">
						<div className="p-2 bg-muted/50 rounded-lg">
							<IndianRupee className="h-5 w-5 text-foreground" />
						</div>
						<span className="text-xs text-muted-foreground">All Time</span>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Admin Earnings (10%)</p>
						<p className="text-2xl font-bold">{formatCurrency(stats?.earnings.adminEarnings || 0)}</p>
						<p className="text-xs text-muted-foreground">
							From {formatCurrency(stats?.earnings.totalRevenue || 0)} total revenue
						</p>
					</div>
				</div>

				{/* This Month Earnings Card */}
				<div className="bg-card border rounded-xl p-6 hover:shadow-sm transition-shadow">
					<div className="flex items-center justify-between mb-4">
						<div className="p-2 bg-muted/50 rounded-lg">
							<TrendingUp className="h-5 w-5 text-foreground" />
						</div>
						<span className="text-xs text-muted-foreground">This Month</span>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Monthly Earnings</p>
						<p className="text-2xl font-bold text-green-600 dark:text-green-400">
							{formatCurrency(stats?.earnings.thisMonthEarnings || 0)}
						</p>
						<p className="text-xs text-muted-foreground">
							From {formatCurrency(stats?.earnings.thisMonthRevenue || 0)} revenue
						</p>
					</div>
				</div>

				{/* Total Bookings Card */}
				<div className="bg-card border rounded-xl p-6 hover:shadow-sm transition-shadow">
					<div className="flex items-center justify-between mb-4">
						<div className="p-2 bg-muted/50 rounded-lg">
							<Calendar className="h-5 w-5 text-foreground" />
						</div>
						<span className="text-xs text-muted-foreground">Platform Wide</span>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Total Bookings</p>
						<p className="text-2xl font-bold">{stats?.bookings.total || 0}</p>
						<p className="text-xs text-muted-foreground">Across all venues</p>
					</div>
				</div>
			</div>

			{/* Main KPI Cards Grid */}
			<div className="grid gap-6 lg:grid-cols-2 mb-6">
				{/* Venues Card */}
				<div className="bg-card border rounded-xl hover:shadow-sm transition-shadow">
					<div className="p-6 flex flex-col justify-between h-full">
						<div>
							{/* Header */}
							<div className="flex items-center gap-3 mb-6">
								<div className="p-2.5 bg-muted/50 rounded-lg">
									<Building2 className="h-5 w-5 text-foreground" />
								</div>
								<div>
									<h3 className="text-lg font-semibold">Venue Management</h3>
									<p className="text-sm text-muted-foreground">Oversee facility approvals</p>
								</div>
							</div>

							{/* Stats Grid */}
							<div className="grid grid-cols-2 gap-3 mb-6">
								<div className="bg-muted/20 rounded-lg p-4">
									<p className="text-xs text-muted-foreground mb-1">Total</p>
									<p className="text-xl font-bold">{stats.venues.total}</p>
								</div>

								<div className="bg-amber-500/10 rounded-lg p-4">
									<p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
										<Clock className="h-3 w-3" />
										Pending
									</p>
									<p className="text-xl font-bold text-amber-600 dark:text-amber-400">{stats.venues.pending}</p>
								</div>

								<div className="bg-emerald-500/10 rounded-lg p-4">
									<p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
										<CheckCircle className="h-3 w-3" />
										Approved
									</p>
									<p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.venues.approved}</p>
								</div>

								<div className="bg-red-500/10 rounded-lg p-4">
									<p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
										<XCircle className="h-3 w-3" />
										Rejected
									</p>
									<p className="text-xl font-bold text-red-600 dark:text-red-400">{stats.venues.rejected}</p>
								</div>
							</div>
						</div>

						{/* Action Button */}
						<Button
							onClick={() => navigate("/admin/venues/approval")}
							variant="secondary"
							className="w-full"
							size="default"
						>
							<Eye className="mr-2 h-4 w-4" />
							Manage Venues
						</Button>
					</div>
				</div>

				{/* Users Card */}
				<div className="bg-card border rounded-xl hover:shadow-sm transition-shadow">
					<div className="p-6 flex flex-col justify-between h-full">
						<div>
							{/* Header */}
							<div className="flex items-center gap-3 mb-6">
								<div className="p-2.5 bg-muted/50 rounded-lg">
									<Users className="h-5 w-5 text-foreground" />
								</div>
								<div>
									<h3 className="text-lg font-semibold">User Management</h3>
									<p className="text-sm text-muted-foreground">Monitor platform users</p>
								</div>
							</div>

							{/* Stats Grid */}
							<div className="space-y-3 mb-6">
								<div className="bg-muted/20 rounded-lg p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs text-muted-foreground mb-1">Regular Users</p>
											<p className="text-2xl font-bold">{stats.users.totalUsers}</p>
										</div>
										<UserCheck className="h-4 w-4 text-muted-foreground" />
									</div>
								</div>

								<div className="bg-muted/20 rounded-lg p-4">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-xs text-muted-foreground mb-1">Facility Owners</p>
											<p className="text-2xl font-bold">{stats.users.totalFacilityOwners}</p>
										</div>
										<Building2 className="h-4 w-4 text-muted-foreground" />
									</div>
								</div>

								<div className="border-t pt-3">
									<div className="flex items-center justify-between">
										<p className="text-sm text-muted-foreground">Total Platform Users</p>
										<p className="text-lg font-semibold">{stats.users.totalUsers + stats.users.totalFacilityOwners}</p>
									</div>
								</div>
							</div>
						</div>

						{/* Action Button */}
						<Button onClick={() => navigate("/admin/users")} variant="secondary" className="w-full" size="default">
							<Eye className="mr-2 h-4 w-4" />
							Manage Users
						</Button>
					</div>
				</div>
			</div>

			{/* Active Courts Section */}
			<div className="grid gap-6 lg:grid-cols-3 mb-6">
				<div className="bg-card border rounded-xl p-6 hover:shadow-sm transition-shadow">
					<div className="flex items-center justify-between mb-4">
						<div className="p-2 bg-muted/50 rounded-lg">
							<Activity className="h-5 w-5 text-foreground" />
						</div>
					</div>
					<div className="space-y-1">
						<p className="text-sm text-muted-foreground">Active Courts</p>
						<p className="text-2xl font-bold">{stats.courts.totalActive}</p>
						<p className="text-xs text-muted-foreground">Available for booking</p>
					</div>
				</div>
			</div>

			{/* Charts Section */}
			<div className="grid gap-6 lg:grid-cols-2 mb-6">
				<EarningsChart data={stats.charts.dailyEarnings} />
				<BookingActivityChart data={stats.charts.dailyBookings} />
			</div>

			{/* Alert for pending venues */}
			{stats.venues.pending > 0 && (
				<div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
					<div className="flex items-start gap-3">
						<Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
						<div className="flex-1">
							<p className="text-sm">
								<span className="font-medium">
									{stats.venues.pending} venue{stats.venues.pending > 1 ? "s" : ""}
								</span>{" "}
								awaiting review
							</p>
							<Button
								variant="link"
								size="sm"
								className="p-0 h-auto text-amber-600 dark:text-amber-400"
								onClick={() => navigate("/admin/venues/approval")}
							>
								Review now →
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminDashboard;
