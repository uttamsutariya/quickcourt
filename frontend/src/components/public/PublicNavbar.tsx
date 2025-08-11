import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import useAuthStore from "@/stores/auth-store";
import useLogout from "@/hooks/useLogout";
import { Trophy, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PublicNavbar = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { isAuthenticated, user } = useAuthStore();
	const handleLogout = useLogout();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const handleDashboardClick = () => {
		if (!user) return;
		const roleRedirects = {
			user: "/user/dashboard",
			facility_owner: "/owner/dashboard",
			admin: "/admin/dashboard",
		};
		navigate(roleRedirects[user.role as keyof typeof roleRedirects] || "/user/dashboard");
	};

	const isActive = (path: string) => location.pathname === path;

	return (
		<nav className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<div className="flex items-center gap-6">
						<Link to="/" className="flex items-center gap-2">
							<div className="p-2 rounded-lg gradient-primary text-white">
								<Trophy className="h-5 w-5" />
							</div>
							<span className="text-xl font-bold hidden sm:inline">QuickCourt</span>
						</Link>

						{/* Desktop Navigation Links */}
						<div className="hidden md:flex items-center gap-6">
							<Link
								to="/"
								className={cn(
									"text-sm font-medium transition-colors hover:text-primary",
									isActive("/") ? "text-primary" : "text-muted-foreground",
								)}
							>
								Home
							</Link>
							<Link
								to="/venues"
								className={cn(
									"text-sm font-medium transition-colors hover:text-primary",
									isActive("/venues") ? "text-primary" : "text-muted-foreground",
								)}
							>
								Browse Venues
							</Link>
						</div>
					</div>

					{/* Desktop Actions */}
					<div className="hidden md:flex items-center gap-4">
						<ThemeToggle />
						{isAuthenticated && user ? (
							<>
								<Button variant="outline" onClick={handleDashboardClick}>
									Dashboard
								</Button>
								<Button onClick={handleLogout} variant="ghost">
									Logout
								</Button>
							</>
						) : (
							<>
								<Button variant="ghost" onClick={() => navigate("/auth/login")}>
									Sign In
								</Button>
								<Button onClick={() => navigate("/auth/role-selection")} className="gradient-primary text-white">
									Get Started
								</Button>
							</>
						)}
					</div>

					{/* Mobile Menu Button */}
					<div className="flex items-center gap-2 md:hidden">
						<ThemeToggle />
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-label="Toggle menu"
						>
							{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</Button>
					</div>
				</div>
			</div>

			{/* Mobile Menu */}
			{mobileMenuOpen && (
				<div className="md:hidden border-t">
					<div className="container mx-auto px-4 py-4 space-y-4">
						<Link
							to="/"
							className={cn(
								"block text-sm font-medium transition-colors hover:text-primary",
								isActive("/") ? "text-primary" : "text-muted-foreground",
							)}
							onClick={() => setMobileMenuOpen(false)}
						>
							Home
						</Link>
						<Link
							to="/venues"
							className={cn(
								"block text-sm font-medium transition-colors hover:text-primary",
								isActive("/venues") ? "text-primary" : "text-muted-foreground",
							)}
							onClick={() => setMobileMenuOpen(false)}
						>
							Browse Venues
						</Link>
						<div className="border-t pt-4 space-y-2">
							{isAuthenticated && user ? (
								<>
									<Button
										variant="outline"
										className="w-full"
										onClick={() => {
											handleDashboardClick();
											setMobileMenuOpen(false);
										}}
									>
										Dashboard
									</Button>
									<Button
										variant="ghost"
										className="w-full"
										onClick={() => {
											handleLogout();
											setMobileMenuOpen(false);
										}}
									>
										Logout
									</Button>
								</>
							) : (
								<>
									<Button
										variant="outline"
										className="w-full"
										onClick={() => {
											navigate("/auth/login");
											setMobileMenuOpen(false);
										}}
									>
										Sign In
									</Button>
									<Button
										className="w-full gradient-primary text-white"
										onClick={() => {
											navigate("/auth/role-selection");
											setMobileMenuOpen(false);
										}}
									>
										Get Started
									</Button>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</nav>
	);
};

export default PublicNavbar;
