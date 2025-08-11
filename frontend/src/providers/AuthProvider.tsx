import { useEffect, type ReactNode } from "react";
import { useAuth } from "@workos-inc/authkit-react";
import { setAccessTokenGetter } from "@/lib/api-client";

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const { getAccessToken } = useAuth();

	useEffect(() => {
		// Set the access token getter for the API client
		setAccessTokenGetter(getAccessToken);
	}, [getAccessToken]);

	return <>{children}</>;
};
