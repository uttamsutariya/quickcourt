import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus, Calendar, TrendingUp, Users, Clock, DollarSign } from "lucide-react";
import useAuthStore from "@/stores/auth-store";
import { Button } from "@/components/ui/button";

const OwnerDashboard = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();

	const stats = [
		{
			title: "Total Venues",
			value: "0",
			description: "Active venues",
			icon: Building2,
			color: "text-blue-500",
			bgColor: "bg-blue-500/10",
		},
		{
			title: "Total Bookings",
			value: "0",
			description: "This month",
			icon: Calendar,
			color: "text-green-500",
			bgColor: "bg-green-500/10",
		},
		{
			title: "Revenue",
			value: "₹0",
			description: "This month",
			icon: DollarSign,
			color: "text-purple-500",
			bgColor: "bg-purple-500/10",
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

	return (
		<div className="container mx-auto p-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
				<p className="text-muted-foreground mt-2">Here's an overview of your facilities</p>
			</div>

			{/* Stats Grid */}
			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
				{stats.map((stat) => (
					<Card key={stat.title}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
							<div className={`p-2 rounded-lg ${stat.bgColor}`}>
								<stat.icon className={`h-4 w-4 ${stat.color}`} />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className="text-xs text-muted-foreground">{stat.description}</p>
						</CardContent>
					</Card>
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

			{/* Recent Activity */}
			<div className="grid gap-6 md:grid-cols-2">
				{/* Recent Bookings */}
				<Card>
					<CardHeader>
						<CardTitle>Recent Bookings</CardTitle>
						<CardDescription>Latest bookings from your venues</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="flex items-center justify-center py-8 text-muted-foreground">
							<div className="text-center">
								<Clock className="h-12 w-12 mx-auto mb-3" />
								<p>No recent bookings</p>
							</div>
						</div>
					</CardContent>
				</Card>

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
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Coming Soon Notice */}
			<Card className="mt-8 border-primary/20 bg-primary/5">
				<CardHeader>
					<CardTitle>🚧 More Features Coming Soon</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">
						We're continuously improving the platform. Soon you'll have access to detailed analytics, automated
						scheduling, customer insights, and much more!
					</p>
				</CardContent>
			</Card>
		</div>
	);
};

export default OwnerDashboard;
