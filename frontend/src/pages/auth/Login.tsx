import { useAuth } from "@workos-inc/authkit-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "@/stores/auth-store";
import { USER_ROLES } from "@/config/constants";

export default function Login() {
	const { signIn, user: workosUser } = useAuth();
	const { user, isAuthenticated, isLoading } = useAuthStore();
	const navigate = useNavigate();

	useEffect(() => {
		if (!workosUser) {
			signIn();
		} else if (!isLoading && isAuthenticated && user) {
			// Define role-based redirect paths
			const roleRedirects = {
				[USER_ROLES.USER]: "/user/dashboard",
				[USER_ROLES.FACILITY_OWNER]: "/owner/dashboard",
				[USER_ROLES.ADMIN]: "/admin/dashboard",
			};

			const redirectPath = roleRedirects[user.role] || "/";
			navigate(redirectPath, { replace: true });
		}
	}, [workosUser, signIn, navigate, isLoading, isAuthenticated, user]);

	return null;
}
