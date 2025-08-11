import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import useAuthStore from "@/stores/auth-store";
import type { UserRole } from "@/config/constants";

interface AuthGateProps {
	children: ReactNode;
}

const AuthGate = ({ children }: AuthGateProps) => {
	const { user, isAuthenticated } = useAuthStore();

	// If authenticated, redirect to appropriate dashboard
	if (isAuthenticated && user) {
		const roleRedirects: Record<UserRole, string> = {
			user: "/user/dashboard",
			facility_owner: "/owner/dashboard",
			admin: "/admin/dashboard",
		};

		return <Navigate to={roleRedirects[user.role] || "/user/dashboard"} replace />;
	}

	// Not authenticated, show the children (ComingSoon page)
	return <>{children}</>;
};

export default AuthGate;
