import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, ChevronDown, LayoutDashboard, Building2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import useAuthStore from "@/stores/auth-store";
import useLogout from "@/hooks/useLogout";
import { USER_ROLES, ROLE_NAMES } from "@/config/constants";

const Navbar = () => {
	const navigate = useNavigate();
	const { user, isAuthenticated } = useAuthStore();
	const handleLogout = useLogout();

	const getDashboardPath = () => {
		switch (user?.role) {
			case USER_ROLES.FACILITY_OWNER:
				return "/owner/dashboard";
			case USER_ROLES.ADMIN:
				return "/admin/dashboard";
			case USER_ROLES.USER:
				return "/user/dashboard";
			default:
				return "/";
		}
	};

	const getRoleIcon = () => {
		switch (user?.role) {
			case USER_ROLES.FACILITY_OWNER:
				return <Building2 className="h-4 w-4" />;
			case USER_ROLES.ADMIN:
				return <Shield className="h-4 w-4" />;
			default:
				return <User className="h-4 w-4" />;
		}
	};

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					{/* Left Section - Logo and Role Badge */}
					<div className="flex items-center">
						<Link to={getDashboardPath()} className="flex shrink-0 items-center">
							<div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
								<span className="text-primary-foreground font-bold text-lg">Q</span>
							</div>
							<span className="ml-2 hidden font-bold text-xl sm:inline-block">QuickCourt</span>
						</Link>

						{/* Role Badge */}
						{user && (
							<div className="ml-6 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
								{getRoleIcon()}
								<span className="text-sm font-medium">{ROLE_NAMES[user.role]}</span>
							</div>
						)}
					</div>

					{/* Right Section - Theme Toggle and User Menu */}
					<div className="flex items-center gap-2">
						{/* Theme Toggle */}
						<ThemeToggle />

						{/* User Menu */}
						{isAuthenticated && user ? (
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<Button variant="ghost" className="flex h-9 items-center gap-2 px-2">
										<div className="h-7 w-7 rounded-full gradient-primary flex shrink-0 items-center justify-center text-primary-foreground font-semibold text-sm">
											{user.name?.charAt(0).toUpperCase() || "U"}
										</div>
										<span className="hidden lg:inline-block text-sm font-medium max-w-[150px] truncate">
											{user.name}
										</span>
										<ChevronDown className="h-4 w-4 opacity-50" />
									</Button>
								</DropdownMenuTrigger>
								<DropdownMenuContent className="w-56" align="end" forceMount>
									<DropdownMenuLabel className="font-normal">
										<div className="flex flex-col space-y-1">
											<p className="text-sm font-medium leading-none">{user.name}</p>
											<p className="text-xs leading-none text-muted-foreground">{user.email}</p>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />

									{/* Dashboard Link */}
									<DropdownMenuItem onClick={() => navigate(getDashboardPath())}>
										<LayoutDashboard className="mr-2 h-4 w-4" />
										<span>Dashboard</span>
									</DropdownMenuItem>

									{/* Profile Link */}
									<DropdownMenuItem
										onClick={() => {
											const profilePath =
												user.role === USER_ROLES.FACILITY_OWNER
													? "/owner/profile"
													: user.role === USER_ROLES.ADMIN
													? "/admin/profile"
													: "/user/profile";
											navigate(profilePath);
										}}
									>
										<User className="mr-2 h-4 w-4" />
										<span>Profile</span>
									</DropdownMenuItem>

									<DropdownMenuSeparator />

									{/* Logout */}
									<DropdownMenuItem onClick={handleLogout} className="text-destructive">
										<LogOut className="mr-2 h-4 w-4" />
										<span>Log out</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>
						) : (
							<Button onClick={() => navigate("/auth/login")} className="gradient-primary text-primary-foreground h-9">
								Sign In
							</Button>
						)}
					</div>
				</div>
			</nav>
		</header>
	);
};

export default Navbar;
