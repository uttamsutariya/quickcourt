import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@workos-inc/authkit-react";
import useAuthStore from "@/stores/auth-store";

/**
 * Custom hook for centralized logout functionality
 * Handles both WorkOS and local state logout
 */
export const useLogout = () => {
	const navigate = useNavigate();
	const { logout: localLogout } = useAuthStore();
	const { signOut: workosSignOut } = useAuth();

	const handleLogout = useCallback(async () => {
		try {
			// Clear local auth state first
			localLogout();

			// Sign out from WorkOS
			// This will redirect to WorkOS logout and then back to the app
			await workosSignOut();

			// Navigate to home page (this might not execute if WorkOS redirects)
			navigate("/");
		} catch (error) {
			console.error("Logout error:", error);
			// Even if WorkOS logout fails, ensure local state is cleared
			localLogout();
			navigate("/");
		}
	}, [localLogout, workosSignOut, navigate]);

	return handleLogout;
};

export default useLogout;
