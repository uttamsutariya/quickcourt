import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@workos-inc/authkit-react";
import useAuthStore from "@/stores/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const AuthCallback = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { user: workosUser, isLoading: workosLoading } = useAuth();
	const { createOrUpdateUser, user, selectedRole, clearSelectedRole } = useAuthStore();
	const [error, setError] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		const handleAuth = async () => {
			if (workosLoading || isProcessing) return;

			if (workosUser) {
				setIsProcessing(true);
				try {
					// Prepare user data from WorkOS
					const userData = {
						workosId: workosUser.id,
						email: workosUser.email || "",
						name: `${workosUser.firstName || ""} ${workosUser.lastName || ""}`.trim() || workosUser.email || "",
						avatarUrl: workosUser.profilePictureUrl || undefined,
						role: selectedRole || "user", // Use selected role or default to 'user'
					};

					console.log("Creating/updating user with role:", userData.role);

					// Create or update user in our database
					// This endpoint handles both new and existing users
					await createOrUpdateUser(userData);

					// Clear selected role from storage after successful auth
					clearSelectedRole();
				} catch (err: any) {
					console.error("Auth callback error:", err);
					setError(err.message || "Failed to complete authentication. Please try again.");
				} finally {
					setIsProcessing(false);
				}
			}
		};

		handleAuth();
	}, [workosUser, workosLoading, isProcessing, createOrUpdateUser, selectedRole, clearSelectedRole]);

	// Handle redirect after user is loaded
	useEffect(() => {
		if (user && !isProcessing) {
			// Get the intended destination or default based on role
			const from = location.state?.from?.pathname;

			const roleRedirects = {
				user: "/user/dashboard",
				facility_owner: "/owner/dashboard",
				admin: "/admin/dashboard",
			};

			const defaultRedirect = roleRedirects[user.role as keyof typeof roleRedirects] || "/user/dashboard";
			const redirectPath = from || defaultRedirect;

			console.log("Redirecting to:", redirectPath, "User role:", user.role);
			navigate(redirectPath, { replace: true });
		}
	}, [user, isProcessing, navigate, location]);

	// Loading state
	if (workosLoading || isProcessing) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-6">
				<Card className="w-full max-w-md">
					<CardContent className="pt-6">
						<div className="flex flex-col items-center space-y-6">
							<div className="relative">
								<Trophy className="h-12 w-12 text-primary animate-pulse-soft" />
								<div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
							</div>

							<div className="space-y-3 text-center">
								<h2 className="text-2xl font-semibold">Loading...</h2>
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

	// Error state
	if (error) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-6">
				<Card className="w-full max-w-md border-destructive/50">
					<CardContent className="pt-6">
						<div className="flex flex-col items-center space-y-6">
							<div className="p-3 rounded-full bg-destructive/10">
								<XCircle className="h-8 w-8 text-destructive" />
							</div>

							<div className="space-y-3 text-center">
								<h2 className="text-2xl font-semibold">Authentication Failed</h2>
								<p className="text-muted-foreground">{error}</p>
							</div>

							<div className="flex gap-3">
								<button
									onClick={() => navigate("/auth/login")}
									className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
								>
									Try Again
								</button>
								<button
									onClick={() => navigate("/")}
									className="px-4 py-2 rounded-md border border-border hover:bg-accent transition-colors"
								>
									Go Home
								</button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Success state (brief, before redirect)
	if (user && !isProcessing) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center p-6">
				<Card className="w-full max-w-md">
					<CardContent className="pt-6">
						<div className="flex flex-col items-center space-y-6">
							<div className="p-3 rounded-full bg-primary/10">
								<CheckCircle className="h-8 w-8 text-primary animate-slide-up" />
							</div>

							<div className="space-y-3 text-center">
								<h2 className="text-2xl font-semibold">Welcome to QuickCourt!</h2>
								<p className="text-muted-foreground">Redirecting you to your dashboard...</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Waiting state (should not normally be visible)
	return null;
};

export default AuthCallback;
