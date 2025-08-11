import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Calendar, MapPin, Trophy, Clock, Star, TrendingUp } from "lucide-react";
import useAuthStore from "@/stores/auth-store";
import { useEffect } from "react";

const UserDashboard = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();

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

	const stats = [
		{ label: "Total Bookings", value: "0", icon: Calendar },
		{ label: "Venues Visited", value: "0", icon: MapPin },
		{
			label: "Member Since",
			value: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
			icon: Star,
		},
	];

	useEffect(() => {
		// If user is new, you might want to show a welcome message or tutorial
		// For now, we'll just ensure they land here properly
	}, []);

	return (
		<div className="space-y-6 my-6">
			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
				{stats.map((stat, index) => (
					<div
						key={index}
						className="bg-white dark:bg-zinc-900 border border-border/50 rounded-xl p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
					>
						<div>
							<p className="text-sm text-muted-foreground">{stat.label}</p>
							<p className="text-2xl font-bold mt-1">{stat.value}</p>
						</div>
						<div className="flex items-center justify-center p-3 rounded-lg bg-primary/10">
							<stat.icon className="h-5 w-5 text-primary" />
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

			{/* Getting Started CTA */}
			<Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
				<CardContent className="p-6">
					<div className="flex flex-col md:flex-row items-center justify-between gap-4">
						<div>
							<h3 className="text-lg font-semibold mb-2">Find Your Perfect Venue</h3>
							<p className="text-muted-foreground">
								Browse through hundreds of sports facilities, check availability, and book instantly.
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
