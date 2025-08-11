import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useAuthStore from "@/stores/auth-store";
import { toast } from "sonner";
import apiClient from "@/lib/api-client";

interface AdminStats {
	totalVenues: number;
	pendingVenues: number;
	approvedVenues: number;
	rejectedVenues: number;
}

const AdminDashboard = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();
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
			// Set mock data for now
			setStats({
				totalVenues: 0,
				pendingVenues: 0,
				approvedVenues: 0,
				rejectedVenues: 0,
			});
		} finally {
			setLoading(false);
		}
	};

	const statsCards = [
		{
			title: "Total Venues",
			value: stats?.totalVenues.toString() || "0",
			description: "All registered venues",
			icon: Building2,
			color: "text-blue-500",
			bgColor: "bg-blue-500/10",
		},
		{
			title: "Pending Review",
			value: stats?.pendingVenues.toString() || "0",
			description: "Awaiting approval",
			icon: Clock,
			color: "text-yellow-500",
			bgColor: "bg-yellow-500/10",
			action: () => navigate("/admin/venues/approval"),
		},
		{
			title: "Approved",
			value: stats?.approvedVenues.toString() || "0",
			description: "Active venues",
			icon: CheckCircle,
			color: "text-green-500",
			bgColor: "bg-green-500/10",
		},
		{
			title: "Rejected",
			value: stats?.rejectedVenues.toString() || "0",
			description: "Declined venues",
			icon: XCircle,
			color: "text-red-500",
			bgColor: "bg-red-500/10",
		},
	];

	if (loading) {
		return (
			<div className="container mx-auto p-6">
				<div className="mb-8">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-4 w-48 mt-2" />
				</div>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
					{[1, 2, 3, 4].map((i) => (
						<div key={i} className="bg-card border rounded-lg p-4">
							<div className="flex items-start justify-between">
								<div className="flex-1">
									<Skeleton className="h-4 w-20 mb-2" />
									<Skeleton className="h-7 w-16 mb-1" />
									<Skeleton className="h-3 w-24" />
								</div>
								<Skeleton className="h-8 w-8 rounded-lg" />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto p-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				<p className="text-muted-foreground mt-2">Manage venues, users, and monitor platform activity</p>
			</div>

			{/* Venue Stats Grid */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
				{statsCards.map((stat) => (
					<div
						key={stat.title}
						className={`bg-card border rounded-lg p-5 transition-all duration-200 ${
							stat.action ? "hover:shadow-lg cursor-pointer hover:border-primary/20" : "hover:shadow-md"
						}`}
						onClick={stat.action}
					>
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
								<p className="text-3xl font-bold mt-2">{stat.value}</p>
								<p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
							</div>
							<div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
								<stat.icon className={`h-5 w-5 ${stat.color}`} />
							</div>
						</div>
						{stat.action && (
							<div className="mt-4 pt-3 border-t border-dashed">
								<span className="text-xs text-primary font-medium flex items-center gap-1">
									View All <Eye className="h-3 w-3" />
								</span>
							</div>
						)}
					</div>
				))}
			</div>

			{/* Quick Actions */}
			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
					<CardDescription>Manage platform operations</CardDescription>
				</CardHeader>
				<CardContent>
					<Button
						onClick={() => navigate("/admin/venues/approval")}
						className="gradient-primary text-primary-foreground w-full sm:w-auto"
					>
						<Building2 className="mr-2 h-4 w-4" />
						Manage Venues
					</Button>
				</CardContent>
			</Card>

			{/* Notification for Pending Venues */}
			{stats && stats.pendingVenues > 0 && (
				<div className="mt-6 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-4">
					<h3 className="text-base font-semibold mb-1 flex items-center gap-2">
						<Clock className="h-5 w-5 text-yellow-500" />
						Venues Awaiting Review
					</h3>
					<p className="text-xs text-muted-foreground mb-4">
						{stats.pendingVenues} venue{stats.pendingVenues > 1 ? "s are" : " is"} waiting for your approval. Review
						them to help facility owners start accepting bookings.
					</p>
					<Button variant="outline" size="sm" onClick={() => navigate("/admin/venues/approval")}>
						Review Pending Venues
					</Button>
				</div>
			)}
		</div>
	);
};

export default AdminDashboard;
