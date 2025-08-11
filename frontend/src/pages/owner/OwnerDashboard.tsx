import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus, Calendar, TrendingUp, Users, Clock, DollarSign, CheckCircle, XCircle } from "lucide-react";
import useAuthStore from "@/stores/auth-store";
import venueService, { type Venue } from "@/services/venue.service";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const OwnerDashboard = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const [venues, setVenues] = useState<Venue[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchVenues();
	}, []);

	const fetchVenues = async () => {
		try {
			setLoading(true);
			const response = await venueService.getMyVenues();
			setVenues(response.venues);
		} catch (error) {
			console.error("Failed to fetch venues:", error);
		} finally {
			setLoading(false);
		}
	};

	// Calculate statistics
	const stats = {
		total: venues.length,
		approved: venues.filter((v) => v.status === "approved")?.length,
		pending: venues.filter((v) => v.status === "pending")?.length,
		rejected: venues.filter((v) => v.status === "rejected")?.length,
	};

	const statsCards = [
		{
			title: "Total Venues",
			value: stats.total.toString(),
			description: "All your venues",
			icon: Building2,
			color: "text-blue-500",
			bgColor: "bg-blue-500/10",
		},
		{
			title: "Approved",
			value: stats.approved.toString(),
			description: "Active venues",
			icon: CheckCircle,
			color: "text-green-500",
			bgColor: "bg-green-500/10",
		},
		{
			title: "Pending",
			value: stats.pending.toString(),
			description: "Awaiting approval",
			icon: Clock,
			color: "text-yellow-500",
			bgColor: "bg-yellow-500/10",
		},
		{
			title: "Rejected",
			value: stats.rejected.toString(),
			description: "Need attention",
			icon: XCircle,
			color: "text-red-500",
			bgColor: "bg-red-500/10",
		},
	];

	const placeholderStats = [
		{
			title: "Total Bookings",
			value: "0",
			description: "This month",
			icon: Calendar,
			color: "text-purple-500",
			bgColor: "bg-purple-500/10",
		},
		{
			title: "Revenue",
			value: "₹0",
			description: "This month",
			icon: DollarSign,
			color: "text-indigo-500",
			bgColor: "bg-indigo-500/10",
		},
		{
			title: "Active Courts",
			value: "0",
			description: "Available for booking",
			icon: Users,
			color: "text-orange-500",
			bgColor: "bg-orange-500/10",
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
				<h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
				<p className="text-muted-foreground mt-2">Here's an overview of your facilities</p>
			</div>

			{/* Venue Stats Grid */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
				{statsCards.map((stat) => (
					<div key={stat.title} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<p className="text-sm text-muted-foreground">{stat.title}</p>
								<p className="text-2xl font-bold mt-1">{stat.value}</p>
								<p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
							</div>
							<div className={`p-2 rounded-lg ${stat.bgColor}`}>
								<stat.icon className={`h-4 w-4 ${stat.color}`} />
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Additional Stats (Placeholders) */}
			<div className="grid gap-4 md:grid-cols-3 mb-6">
				{placeholderStats.map((stat) => (
					<div key={stat.title} className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
						<div className="flex items-start justify-between">
							<div className="flex-1">
								<p className="text-sm text-muted-foreground">{stat.title}</p>
								<p className="text-2xl font-bold mt-1">{stat.value}</p>
								<p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
							</div>
							<div className={`p-2 rounded-lg ${stat.bgColor}`}>
								<stat.icon className={`h-4 w-4 ${stat.color}`} />
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Quick Actions */}
			<Card className="mb-8">
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
					<CardDescription>Manage your sports facilities</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-3">
					<Button onClick={() => navigate("/owner/venues/new")} className="gradient-primary text-primary-foreground">
						<Plus className="mr-2 h-4 w-4" />
						Add New Venue
					</Button>
					<Button variant="outline" onClick={() => navigate("/owner/venues")}>
						<Building2 className="mr-2 h-4 w-4" />
						Manage Venues
					</Button>
					<Button variant="outline" onClick={() => navigate("/owner/bookings")}>
						<Calendar className="mr-2 h-4 w-4" />
						View Bookings
					</Button>
				</CardContent>
			</Card>

			{stats.rejected > 0 && (
				<div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/5 p-4 mb-8">
					<h3 className="text-base font-semibold mb-1 flex items-center gap-2">
						<XCircle className="h-5 w-5 text-red-500" />
						Venues Need Attention
					</h3>
					<p className="text-xs text-muted-foreground mb-4">
						{stats.rejected} venue{stats.rejected > 1 ? "s have" : " has"} been rejected. Please review and update them
						to meet the requirements.
					</p>
					<Button variant="outline" className="mt-2" onClick={() => navigate("/owner/venues")}>
						View Rejected Venues
					</Button>
				</div>
			)}

			{/* Recent Activity */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Revenue Trend */}
				<Card>
					<CardHeader>
						<CardTitle>Revenue Trend</CardTitle>
						<CardDescription>Your earnings over time</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-center py-8 text-muted-foreground">
							<div className="text-center">
								<TrendingUp className="h-12 w-12 mx-auto mb-3" />
								<p>No data available</p>
								<p className="text-xs mt-2">Revenue tracking coming soon</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Coming Soon Notice */}
			{stats.approved === 0 && stats.total > 0 && (
				<div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
					<h3 className="text-base font-semibold mb-1">🎯 Next Steps</h3>
					<p className="text-xs text-muted-foreground">
						Once your venues are approved, you'll be able to add courts, set up time slots, and start receiving
						bookings. The admin will review your submissions shortly.
					</p>
				</div>
			)}
		</div>
	);
};

export default OwnerDashboard;
