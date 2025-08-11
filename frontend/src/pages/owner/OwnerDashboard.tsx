import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
	Building2,
	Plus,
	Calendar,
	TrendingUp,
	Clock,
	CheckCircle,
	XCircle,
	Activity,
	ChartBar,
	Eye,
	IndianRupee,
	AlertCircle,
	ArrowUpRight,
} from "lucide-react";
import useAuthStore from "@/stores/auth-store";
import ownerDashboardService, { type DashboardStats } from "@/services/owner-dashboard.service";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const OwnerDashboard = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const [stats, setStats] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchDashboardStats();
	}, []);

	const fetchDashboardStats = async () => {
		try {
			setLoading(true);
			const data = await ownerDashboardService.getDashboardStats();
			setStats(data);
		} catch (error: any) {
			console.error("Failed to fetch dashboard stats:", error);
			toast.error(error.response?.data?.message || "Failed to fetch dashboard statistics");
		} finally {
			setLoading(false);
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
					<Button onClick={fetchDashboardStats}>Retry</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6 max-w-7xl">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
				<p className="text-muted-foreground mt-2">Here's your business overview at a glance</p>
			</div>

			{/* Main KPI Cards Grid */}
			<div className="grid gap-6 lg:grid-cols-2 mb-6">
				{/* Venues Card */}
				<div className="bg-card dark:bg-zinc-950 border rounded-lg shadow-sm">
					<div className="p-6">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-muted rounded-lg">
									<Building2 className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 className="text-lg font-semibold">Venue Overview</h3>
									<p className="text-sm text-muted-foreground">Manage your sports facilities</p>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-4 mb-6">
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground">Total</p>
								<p className="text-2xl font-bold">{stats.venues.total}</p>
							</div>
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground flex items-center gap-1">
									<CheckCircle className="h-3.5 w-3.5 text-green-500" />
									Approved
								</p>
								<p className="text-2xl font-bold">{stats.venues.approved}</p>
							</div>
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground flex items-center gap-1">
									<Clock className="h-3.5 w-3.5 text-yellow-500" />
									Pending
								</p>
								<p className="text-2xl font-bold">{stats.venues.pending}</p>
							</div>
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground flex items-center gap-1">
									<XCircle className="h-3.5 w-3.5 text-red-500" />
									Rejected
								</p>
								<p className="text-2xl font-bold">{stats.venues.rejected}</p>
							</div>
						</div>

						<div className="flex gap-3">
							<Button onClick={() => navigate("/owner/venues/new")} className="flex-1" variant="default" size="default">
								<Plus className="mr-2 h-4 w-4" />
								Add Venue
							</Button>
							<Button variant="outline" onClick={() => navigate("/owner/venues")} className="flex-1" size="default">
								<Eye className="mr-2 h-4 w-4" />
								View All
							</Button>
						</div>
					</div>
				</div>

				{/* Bookings Card */}
				<div className="bg-card dark:bg-zinc-950 border rounded-lg shadow-sm">
					<div className="p-6">
						<div className="flex items-center justify-between mb-6">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-muted rounded-lg">
									<Calendar className="h-5 w-5 text-primary" />
								</div>
								<div>
									<h3 className="text-lg font-semibold">Booking Statistics</h3>
									<p className="text-sm text-muted-foreground">Track your bookings performance</p>
								</div>
							</div>
						</div>

						<div className="grid grid-cols-3 gap-4 mb-6">
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground">Total</p>
								<p className="text-2xl font-bold">{stats.bookings.total}</p>
							</div>
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground">Today</p>
								<p className="text-2xl font-bold text-primary">{stats.bookings.today}</p>
							</div>
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground">This Month</p>
								<p className="text-2xl font-bold text-primary">{stats.bookings.thisMonth}</p>
							</div>
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground flex items-center gap-1">
									<ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />
									Upcoming
								</p>
								<p className="text-xl font-semibold">{stats.bookings.upcoming}</p>
							</div>
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground flex items-center gap-1">
									<CheckCircle className="h-3.5 w-3.5 text-green-500" />
									Completed
								</p>
								<p className="text-xl font-semibold">{stats.bookings.completed}</p>
							</div>
							<div className="space-y-1">
								<p className="text-sm text-muted-foreground flex items-center gap-1">
									<XCircle className="h-3.5 w-3.5 text-red-500" />
									Cancelled
								</p>
								<p className="text-xl font-semibold">{stats.bookings.cancelled}</p>
							</div>
						</div>

						<Button onClick={() => navigate("/owner/bookings")} className="w-full" variant="default" size="default">
							<Calendar className="mr-2 h-4 w-4" />
							View All Bookings
						</Button>
					</div>
				</div>
			</div>

			{/* Secondary KPI Cards */}
			<div className="grid gap-6 lg:grid-cols-2 mb-6">
				{/* Active Courts Card */}
				<div className="bg-card dark:bg-zinc-950 border rounded-lg shadow-sm">
					<div className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="p-2.5 bg-muted rounded-lg">
									<Activity className="h-6 w-6 text-primary" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Active Courts</p>
									<p className="text-3xl font-bold mt-1">{stats.courts.totalActive}</p>
									<p className="text-xs text-muted-foreground mt-1">Available for booking</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Earnings Card */}
				<div className="bg-card dark:bg-zinc-950 border rounded-lg shadow-sm">
					<div className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<div className="flex items-center gap-3 mb-4">
									<div className="p-2.5 bg-muted rounded-lg">
										<IndianRupee className="h-6 w-6 text-primary" />
									</div>
									<div>
										<p className="text-sm text-muted-foreground">Net Earnings</p>
										<p className="text-xs text-muted-foreground">After 10% commission</p>
									</div>
								</div>
								<div className="space-y-3">
									<div className="flex items-baseline justify-between">
										<p className="text-2xl font-bold text-primary">{formatCurrency(stats.earnings.netEarnings)}</p>
										<span className="text-xs text-muted-foreground">All time</span>
									</div>
									<div className="pt-3 border-t">
										<div className="flex items-baseline justify-between">
											<p className="text-lg font-semibold">{formatCurrency(stats.earnings.thisMonthNetEarnings)}</p>
											<span className="text-xs text-muted-foreground">This month</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Earnings Graph Placeholder */}
			<div className="bg-card dark:bg-zinc-950 border rounded-lg shadow-sm p-6">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-muted rounded-lg">
							<ChartBar className="h-5 w-5 text-primary" />
						</div>
						<div>
							<h3 className="text-lg font-semibold">Revenue Trends</h3>
							<p className="text-sm text-muted-foreground">Track your earnings over time</p>
						</div>
					</div>
					<Button variant="outline" size="sm" disabled>
						Coming Soon
					</Button>
				</div>
				<div className="flex items-center justify-center py-16 text-muted-foreground">
					<div className="text-center">
						<TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-20" />
						<p className="text-lg font-medium mb-2">Revenue Analytics Coming Soon</p>
						<p className="text-sm max-w-md">
							Interactive charts showing your revenue trends, peak booking times, and earnings projections will be
							available here.
						</p>
					</div>
				</div>
			</div>

			{/* Alert for rejected venues */}
			{stats.venues.rejected > 0 && (
				<div className="mt-6 bg-destructive/5 border border-destructive/20 rounded-lg p-4">
					<div className="flex items-start gap-3">
						<AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
						<div className="flex-1">
							<h3 className="text-sm font-semibold mb-1">Action Required</h3>
							<p className="text-sm text-muted-foreground mb-3">
								{stats.venues.rejected} venue{stats.venues.rejected > 1 ? "s have" : " has"} been rejected. Please
								review and update to meet the requirements.
							</p>
							<Button variant="outline" size="sm" onClick={() => navigate("/owner/venues")}>
								Review Venues
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default OwnerDashboard;
