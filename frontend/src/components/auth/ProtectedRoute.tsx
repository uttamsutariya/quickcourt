import { Navigate, useLocation } from "react-router-dom";
import { type ReactNode, useEffect } from "react";
import useAuthStore from "@/stores/auth-store";
import type { UserRole } from "@/config/constants";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
	children: ReactNode;
	allowedRoles?: UserRole[];
	redirectTo?: string;
}

const ProtectedRoute = ({ children, allowedRoles = [], redirectTo = "/auth/login" }: ProtectedRouteProps) => {
	const { user, isAuthenticated, isLoading, fetchCurrentUser } = useAuthStore();
	const location = useLocation();

	useEffect(() => {
		if (!user && isAuthenticated) {
			fetchCurrentUser();
		}
	}, [isAuthenticated, user, fetchCurrentUser]);

	// Show loading state
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="space-y-4 w-full max-w-md">
					<Skeleton className="h-12 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-8 w-1/2 mx-auto" />
				</div>
			</div>
		);
	}

	// Not authenticated
	if (!isAuthenticated || !user) {
		return <Navigate to={redirectTo} state={{ from: location }} replace />;
	}

	// Check role-based access
	if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
		// Redirect based on user role
		const roleRedirects: Record<UserRole, string> = {
			user: "/dashboard",
			facility_owner: "/owner/dashboard",
			admin: "/admin/dashboard",
		};

		return <Navigate to={roleRedirects[user.role] || "/"} replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
