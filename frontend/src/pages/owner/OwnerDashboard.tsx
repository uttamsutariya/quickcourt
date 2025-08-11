import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Plus, BarChart3, Calendar, Settings, LogOut } from "lucide-react";
import useAuthStore from "@/stores/auth-store";
import { useAuth } from "@workos-inc/authkit-react";

const OwnerDashboard = () => {
	const navigate = useNavigate();
	const { user, logout } = useAuthStore();
	const { signOut: workosLogout } = useAuth();

	const handleLogout = () => {
		logout();
		workosLogout();
		navigate("/");
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="border-b">
				<div className="container mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Building2 className="h-8 w-8 text-primary" />
							<div>
								<h1 className="text-2xl font-bold">Facility Owner Dashboard</h1>
								<p className="text-sm text-muted-foreground">Welcome back, {user?.name}</p>
							</div>
						</div>
						<Button variant="ghost" onClick={handleLogout}>
							<LogOut className="h-4 w-4 mr-2" />
							Logout
						</Button>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container mx-auto px-6 py-8">
				<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{/* Add Venue Card */}
					<Card className="hover:shadow-lg transition-shadow cursor-pointer border-dashed border-2">
						<CardHeader className="text-center">
							<div className="mx-auto p-3 rounded-full bg-primary/10 w-fit mb-2">
								<Plus className="h-8 w-8 text-primary" />
							</div>
							<CardTitle>Add New Venue</CardTitle>
							<CardDescription>List your sports facility on QuickCourt</CardDescription>
						</CardHeader>
						<CardContent>
							<Button className="w-full gradient-primary text-white">Add Venue</Button>
						</CardContent>
					</Card>

					{/* Manage Venues Card */}
					<Card className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<div className="flex items-center justify-between">
								<Building2 className="h-6 w-6 text-primary" />
								<span className="text-2xl font-bold">0</span>
							</div>
							<CardTitle>My Venues</CardTitle>
							<CardDescription>Manage your listed facilities</CardDescription>
						</CardHeader>
						<CardContent>
							<Button variant="outline" className="w-full">
								View All
							</Button>
						</CardContent>
					</Card>

					{/* Bookings Card */}
					<Card className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<div className="flex items-center justify-between">
								<Calendar className="h-6 w-6 text-primary" />
								<span className="text-2xl font-bold">0</span>
							</div>
							<CardTitle>Total Bookings</CardTitle>
							<CardDescription>This month's bookings</CardDescription>
						</CardHeader>
						<CardContent>
							<Button variant="outline" className="w-full">
								View Calendar
							</Button>
						</CardContent>
					</Card>

					{/* Revenue Card */}
					<Card className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<div className="flex items-center justify-between">
								<BarChart3 className="h-6 w-6 text-primary" />
								<span className="text-2xl font-bold">₹0</span>
							</div>
							<CardTitle>Revenue</CardTitle>
							<CardDescription>This month's earnings</CardDescription>
						</CardHeader>
						<CardContent>
							<Button variant="outline" className="w-full">
								View Report
							</Button>
						</CardContent>
					</Card>

					{/* Settings Card */}
					<Card className="hover:shadow-lg transition-shadow">
						<CardHeader>
							<Settings className="h-6 w-6 text-primary mb-2" />
							<CardTitle>Settings</CardTitle>
							<CardDescription>Manage your account settings</CardDescription>
						</CardHeader>
						<CardContent>
							<Button variant="outline" className="w-full">
								Open Settings
							</Button>
						</CardContent>
					</Card>
				</div>

				{/* Coming Soon Notice */}
				<div className="mt-8 p-6 rounded-lg bg-primary/5 border border-primary/20">
					<h3 className="text-lg font-semibold mb-2">🚧 Features Coming Soon</h3>
					<p className="text-muted-foreground">
						We're working on bringing you powerful tools to manage your sports facilities. Stay tuned for venue
						management, court scheduling, booking management, and detailed analytics!
					</p>
				</div>
			</main>
		</div>
	);
};

export default OwnerDashboard;
