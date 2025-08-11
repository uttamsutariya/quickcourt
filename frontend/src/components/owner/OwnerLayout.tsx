import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Building2, LayoutDashboard, Plus, Settings, LogOut, Menu, X, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import useAuthStore from "@/stores/auth-store";
import useLogout from "@/hooks/useLogout";

const OwnerLayout = () => {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const location = useLocation();
	const { user } = useAuthStore();
	const handleLogout = useLogout();

	const menuItems = [
		{
			title: "Dashboard",
			icon: LayoutDashboard,
			href: "/owner/dashboard",
		},
		{
			title: "My Venues",
			icon: Building2,
			href: "/owner/venues",
		},
		{
			title: "Add Venue",
			icon: Plus,
			href: "/owner/venues/new",
		},
		{
			title: "Bookings",
			icon: Calendar,
			href: "/owner/bookings",
		},
		{
			title: "Settings",
			icon: Settings,
			href: "/owner/settings",
		},
	];

	return (
		<div className="min-h-screen bg-background">
			{/* Mobile sidebar backdrop */}
			{sidebarOpen && (
				<div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					"fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
					sidebarOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<div className="flex flex-col h-full">
					{/* Logo */}
					<div className="p-6 border-b">
						<div className="flex items-center justify-between">
							<Link to="/owner/dashboard" className="flex items-center space-x-2">
								<div className="p-2 rounded-lg gradient-primary">
									<Building2 className="h-6 w-6 text-primary-foreground" />
								</div>
								<span className="text-xl font-bold">QuickCourt</span>
							</Link>
							<button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded hover:bg-accent">
								<X className="h-5 w-5" />
							</button>
						</div>
					</div>

					{/* User Info */}
					<div className="px-6 py-4 border-b">
						<div className="flex items-center space-x-3">
							<div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
								{user?.name?.charAt(0).toUpperCase() || "O"}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate">{user?.name}</p>
								<p className="text-xs text-muted-foreground truncate">Facility Owner</p>
							</div>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 p-4 space-y-1">
						{menuItems.map((item) => {
							const isActive = location.pathname === item.href;
							return (
								<Link
									key={item.href}
									to={item.href}
									className={cn(
										"flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
										isActive ? "bg-primary text-primary-foreground" : "hover:bg-accent hover:text-accent-foreground",
									)}
								>
									<item.icon className="h-5 w-5" />
									<span className="font-medium">{item.title}</span>
									{isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
								</Link>
							);
						})}
					</nav>

					{/* Theme & Logout */}
					<div className="p-4 border-t space-y-2">
						<div className="flex items-center justify-between px-3">
							<span className="text-sm font-medium">Theme</span>
							<ThemeToggle />
						</div>
						<Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
							<LogOut className="mr-2 h-5 w-5" />
							Logout
						</Button>
					</div>
				</div>
			</aside>

			{/* Main Content */}
			<div className="lg:pl-64">
				{/* Mobile Header */}
				<header className="sticky top-0 z-30 bg-background border-b lg:hidden">
					<div className="flex items-center justify-between p-4">
						<button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-accent">
							<Menu className="h-6 w-6" />
						</button>
						<span className="text-lg font-semibold">QuickCourt</span>
						<div className="w-10" /> {/* Spacer for centering */}
					</div>
				</header>

				{/* Page Content */}
				<main className="min-h-screen">
					<Outlet />
				</main>
			</div>
		</div>
	);
};

export default OwnerLayout;
