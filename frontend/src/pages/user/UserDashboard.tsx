import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Calendar, MapPin, Trophy, Star, IndianRupee, Clock, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import userDashboardService, { type UserDashboardStats } from "@/services/user-dashboard.service";

const UserDashboard = () => {
	const navigate = useNavigate();
	const [stats, setStats] = useState<UserDashboardStats | null>(null);
	const [loading, setLoading] = useState(true);

	// Quick action cards
	const quickActions = [
		{
			title: "Browse Venues",
			description: "Explore sports facilities near you",
			icon: MapPin,
			action: () => navigate("/venues"),
			color: "text-primary",
			bgColor: "bg-primary/10",
		},
		{
			title: "My Bookings",
			description: "View and manage your bookings",
			icon: Calendar,
			action: () => navigate("/user/bookings"),
			color: "text-blue-600",
			bgColor: "bg-blue-600/10",
		},
		{
			title: "Popular Sports",
			description: "Find venues by sport type",
			icon: Trophy,
			action: () => navigate("/venues"),
			color: "text-orange-600",
			bgColor: "bg-orange-600/10",
		},
	];

	// Fetch dashboard stats
	useEffect(() => {
		fetchDashboardStats();
	}, []);

	const fetchDashboardStats = async () => {
		try {
			setLoading(true);
			const data = await userDashboardService.getDashboardStats();
			setStats(data);
		} catch (error: any) {
			console.error("Failed to fetch dashboard stats:", error);
			toast.error("Failed to load dashboard statistics");
		} finally {
			setLoading(false);
		}
	};

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-IN", {
			style: "currency",
			currency: "INR",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(amount);
	};

	// Generate stats array from fetched data
	const getStatsCards = () => {
		if (!stats) return [];

		return [
			{
				label: "Total Bookings",
				value: stats.totalBookings.toString(),
				icon: Calendar,
				color: "text-blue-600",
				bgColor: "bg-blue-600/10",
			},
			{
				label: "Venues Visited",
				value: stats.venuesVisited.toString(),
				icon: MapPin,
				color: "text-green-600",
				bgColor: "bg-green-600/10",
			},
			{
				label: "Upcoming",
				value: stats.upcomingBookings.toString(),
				icon: Clock,
				color: "text-orange-600",
				bgColor: "bg-orange-600/10",
			},
			{
				label: "Completed",
				value: stats.completedBookings.toString(),
				icon: CheckCircle,
				color: "text-emerald-600",
				bgColor: "bg-emerald-600/10",
			},
			{
				label: "Total Spent",
				value: formatCurrency(stats.totalAmountSpent),
				icon: IndianRupee,
				color: "text-purple-600",
				bgColor: "bg-purple-600/10",
			},
			{ label: "Member Since", value: stats.memberSince, icon: Star, color: "text-primary", bgColor: "bg-primary/10" },
		];
	};

	return (
		<div className="space-y-6 my-6">
			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
				{loading
					? // Loading skeleton
					  Array.from({ length: 6 }).map((_, index) => (
							<div key={index} className="bg-white dark:bg-zinc-900 border border-border/50 rounded-xl p-6">
								<Skeleton className="h-4 w-24 mb-2" />
								<Skeleton className="h-8 w-16 mb-4" />
								<Skeleton className="h-5 w-5 rounded-lg ml-auto" />
							</div>
					  ))
					: // Real stats
					  getStatsCards().map((stat, index) => (
							<div
								key={index}
								className="bg-white dark:bg-zinc-900 border border-border/50 rounded-xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
							>
								<div>
									<p className="text-sm text-muted-foreground">{stat.label}</p>
									<p className="text-2xl font-bold mt-1">{stat.value}</p>
								</div>
								<div className={`flex items-center justify-center p-3 rounded-lg ${stat.bgColor}`}>
									<stat.icon className={`h-5 w-5 ${stat.color}`} />
								</div>
							</div>
					  ))}
			</div>

			{/* Quick Actions */}
			<div>
				<h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
				<div className="grid grid-cols-1 gap-5">
					{quickActions.map((action, index) => (
						<div
							key={index}
							className="cursor-pointer bg-white dark:bg-zinc-900 border border-border/50 rounded-lg p-5 flex items-start justify-between hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group"
							onClick={action.action}
						>
							<div className="flex items-center gap-4">
								<div className={`p-3 rounded-md ${action.bgColor} dark:bg-opacity-20`}>
									<action.icon className={`h-5 w-5 ${action.color} dark:text-opacity-90`} />
								</div>
								<div>
									<div className="text-base font-medium mb-1">{action.title}</div>
									<div className="text-sm text-muted-foreground">{action.description}</div>
								</div>
							</div>
							<ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
						</div>
					))}
				</div>
			</div>

			{/* Recent Bookings Section */}
			{!loading && stats && stats.recentBookings.length > 0 && (
				<div>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-semibold">Recent Bookings</h2>
						<Button variant="outline" size="sm" onClick={() => navigate("/user/bookings")}>
							View All
						</Button>
					</div>
					<div className="space-y-3">
						{stats.recentBookings.slice(0, 2).map((booking) => (
							<div
								key={booking._id}
								className="bg-white dark:bg-zinc-900 border border-border/50 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow"
							>
								<div className="flex items-center gap-4">
									<div className="flex-shrink-0">
										{booking.venueId.images && booking.venueId.images.length > 0 ? (
											<img
												src={booking.venueId.images[0]}
												alt={booking.venueId.name}
												className="w-12 h-12 rounded-lg object-cover"
											/>
										) : (
											<div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
												<Trophy className="h-6 w-6 text-muted-foreground" />
											</div>
										)}
									</div>
									<div>
										<h3 className="font-medium">{booking.venueId.name}</h3>
										<p className="text-sm text-muted-foreground">
											{booking.courtId.name} • {booking.courtId.sportType}
										</p>
										<p className="text-xs text-muted-foreground">
											{new Date(booking.bookingDate).toLocaleDateString("en-IN", {
												weekday: "short",
												month: "short",
												day: "numeric",
											})}{" "}
											• {booking.startTime} - {booking.endTime}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="font-semibold">{formatCurrency(booking.totalAmount)}</p>
									<span
										className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
											booking.status === "confirmed"
												? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
												: booking.status === "completed"
												? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
												: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
										}`}
									>
										{booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
									</span>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Getting Started CTA */}
			<Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
				<CardContent className="p-6">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<div>
							<h3 className="text-lg font-semibold mb-2">
								{!loading && stats && stats.totalBookings > 0 ? "Discover More Venues" : "Find Your Perfect Venue"}
							</h3>
							<p className="text-muted-foreground">
								{!loading && stats && stats.totalBookings > 0
									? "Explore new sports facilities and expand your playing experience."
									: "Browse through hundreds of sports facilities, check availability, and book instantly."}
							</p>
						</div>
						<Button size="lg" className="bg-primary hover:bg-primary/90" onClick={() => navigate("/venues")}>
							Browse Venues
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default UserDashboard;
