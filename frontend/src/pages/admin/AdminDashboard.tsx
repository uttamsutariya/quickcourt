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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

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
}

const AdminDashboard = () => {
	const navigate = useNavigate();
	const [stats, setStats] = useState<AdminStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchStats();
	}, []);

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

			{/* Main KPI Cards Grid */}
			<div className="grid gap-6 lg:grid-cols-2 mb-6">
				{/* Venues Card */}
				<div className="bg-card dark:bg-zinc-950 border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
					<div className="p-6 flex flex-col justify-between h-full">
						<div>
							{/* Header */}
							<div className="flex items-center gap-3 mb-8">
								<div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
									<Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
								</div>
								<div>
									<h3 className="text-xl font-bold text-foreground">Venue Management</h3>
									<p className="text-sm text-muted-foreground">Oversee facility approvals</p>
								</div>
							</div>

							{/* Stats Grid */}
							<div className="grid grid-cols-2 gap-4 mb-8">
								<div className="bg-muted/30 rounded-lg p-4 border">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-muted-foreground">Total Venues</span>
										<Building2 className="h-4 w-4 text-muted-foreground" />
									</div>
									<p className="text-2xl font-bold text-foreground">{stats.venues.total}</p>
								</div>

								<div className="bg-yellow-50/80 dark:bg-yellow-950/30 rounded-lg p-4 border border-yellow-200/50 dark:border-yellow-800/50">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Pending Review</span>
										<Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
									</div>
									<p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.venues.pending}</p>
								</div>

								<div className="bg-green-50/80 dark:bg-green-950/30 rounded-lg p-4 border border-green-200/50 dark:border-green-800/50">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-green-700 dark:text-green-300">Approved</span>
										<CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
									</div>
									<p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.venues.approved}</p>
								</div>

								<div className="bg-red-50/80 dark:bg-red-950/30 rounded-lg p-4 border border-red-200/50 dark:border-red-800/50">
									<div className="flex items-center justify-between mb-2">
										<span className="text-sm font-medium text-red-700 dark:text-red-300">Rejected</span>
										<XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
									</div>
									<p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.venues.rejected}</p>
								</div>
							</div>
						</div>

						{/* Action Button */}
						<Button
							onClick={() => navigate("/admin/venues/approval")}
							className="w-full h-11 text-sm font-medium"
							size="default"
						>
							<Eye className="mr-2 h-4 w-4" />
							Manage Venues
						</Button>
					</div>
				</div>

				{/* Users Card */}
				<div className="bg-card dark:bg-zinc-950 border rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
					<div className="p-6 flex flex-col justify-between h-full">
						<div>
							{/* Header */}
							<div className="flex items-center gap-3 mb-8">
								<div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
									<Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
								</div>
								<div>
									<h3 className="text-xl font-bold text-foreground">User Management</h3>
									<p className="text-sm text-muted-foreground">Monitor platform users</p>
								</div>
							</div>

							{/* Stats Grid */}
							<div className="grid grid-cols-1 gap-4 mb-8">
								<div className="bg-blue-50/80 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200/50 dark:border-blue-800/50">
									<div className="flex items-center justify-between mb-3">
										<span className="text-sm font-medium text-blue-700 dark:text-blue-300">Regular Users</span>
										<UserCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
									</div>
									<p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.users.totalUsers}</p>
								</div>

								<div className="bg-emerald-50/80 dark:bg-emerald-950/30 rounded-lg p-4 border border-emerald-200/50 dark:border-emerald-800/50">
									<div className="flex items-center justify-between mb-3">
										<span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Facility Owners</span>
										<Building2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
									</div>
									<p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">
										{stats.users.totalFacilityOwners}
									</p>
								</div>

								<div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-lg p-4 border border-indigo-200/50 dark:border-indigo-800/50">
									<div className="flex items-center justify-between mb-3">
										<span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
											Total Platform Users
										</span>
										<Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
									</div>
									<p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">
										{stats.users.totalUsers + stats.users.totalFacilityOwners}
									</p>
								</div>
							</div>
						</div>

						{/* Action Button */}
						<Button onClick={() => navigate("/admin/users")} className="w-full h-11 text-sm font-medium" size="default">
							<Eye className="mr-2 h-4 w-4" />
							Manage Users
						</Button>
					</div>
				</div>
			</div>

			{/* Secondary KPI Cards */}
			<div className="grid gap-6 lg:grid-cols-2 mb-6">
				{/* Bookings Card */}
				<div className="bg-card dark:bg-zinc-950 border rounded-lg shadow-sm">
					<div className="p-6">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="p-2.5 bg-muted rounded-lg">
									<Calendar className="h-6 w-6 text-primary" />
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Total Bookings</p>
									<p className="text-3xl font-bold mt-1">{stats.bookings.total}</p>
									<p className="text-xs text-muted-foreground mt-1">Platform-wide bookings</p>
								</div>
							</div>
						</div>
					</div>
				</div>

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
			</div>

			{/* Alert for pending venues */}
			{stats.venues.pending > 0 && (
				<div className="bg-yellow-500/5 dark:bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
					<div className="flex items-start gap-3">
						<Clock className="h-5 w-5 text-yellow-500 mt-0.5" />
						<div className="flex-1">
							<h3 className="text-sm font-semibold mb-1">Venues Awaiting Review</h3>
							<p className="text-sm text-muted-foreground mb-3">
								{stats.venues.pending} venue{stats.venues.pending > 1 ? "s are" : " is"} waiting for your approval.
								Review them to help facility owners start accepting bookings.
							</p>
							<Button variant="outline" size="sm" onClick={() => navigate("/admin/venues/approval")}>
								Review Pending Venues
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminDashboard;
