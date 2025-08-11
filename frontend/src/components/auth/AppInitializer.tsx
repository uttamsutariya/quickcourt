import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@workos-inc/authkit-react";
import useAuthStore from "@/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AppInitializerProps {
	children: ReactNode;
}

const AppInitializer = ({ children }: AppInitializerProps) => {
	const { isLoading: workosLoading } = useAuth();
	const { user, isAuthenticated, fetchCurrentUser, setLoading, isLoading } = useAuthStore();
	const [isInitializing, setIsInitializing] = useState(true);

	useEffect(() => {
		const initializeAuth = async () => {
			// If we have a persisted auth state but no user data, fetch it
			if (isAuthenticated && !user) {
				setLoading(true);
				try {
					await fetchCurrentUser();
				} catch (error) {
					console.error("Failed to fetch user on init:", error);
				} finally {
					setLoading(false);
				}
			}

			// Mark initialization as complete
			setIsInitializing(false);
		};

		// Wait for WorkOS to finish loading before initializing
		if (!workosLoading) {
			initializeAuth();
		}
	}, [workosLoading, isAuthenticated, user, fetchCurrentUser, setLoading]);

	// Show loading state while initializing
	if (workosLoading || isInitializing || (isAuthenticated && isLoading)) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-6">
				<Card className="w-full max-w-md">
					<CardContent className="pt-6">
						<div className="flex flex-col items-center space-y-6">
							<div className="relative">
								<Trophy className="h-12 w-12 text-primary animate-pulse" />
								<div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
							</div>

							<div className="space-y-3 text-center">
								<h2 className="text-2xl font-semibold">Loading QuickCourt</h2>
								<p className="text-muted-foreground">Please wait...</p>
							</div>

							<div className="w-full space-y-3">
								<Skeleton className="h-4 w-full" />
								<Skeleton className="h-4 w-3/4 mx-auto" />
								<Skeleton className="h-4 w-1/2 mx-auto" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return <>{children}</>;
};

export default AppInitializer;
