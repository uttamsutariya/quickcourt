import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthKitProvider } from "@workos-inc/authkit-react";
import { Toaster } from "@/components/ui/sonner";

// Config
import { WORKOS_CLIENT_ID, WORKOS_REDIRECT_URI } from "@/config/constants";

// Auth Pages
import Login from "@/pages/auth/Login";
import RoleSelection from "@/pages/auth/RoleSelection";
import AuthCallback from "@/pages/auth/AuthCallback";

// Protected Pages
import OwnerDashboard from "@/pages/owner/OwnerDashboard";
import ComingSoon from "@/pages/ComingSoon";

// Components
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AuthProvider } from "@/providers/AuthProvider";

// Create a query client
const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5, // 5 minutes
			retry: 1,
		},
	},
});

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthKitProvider clientId={WORKOS_CLIENT_ID} redirectUri={WORKOS_REDIRECT_URI}>
				<AuthProvider>
					<Router>
						<Routes>
							{/* Public Routes */}
							<Route path="/" element={<ComingSoon />} />
							<Route path="/auth/login" element={<Login />} />
							<Route path="/auth/role-selection" element={<RoleSelection />} />
							<Route path="/auth/callback" element={<AuthCallback />} />

							{/* User Dashboard (Coming Soon) */}
							<Route
								path="/dashboard"
								element={
									<ProtectedRoute allowedRoles={["user"]}>
										<ComingSoon />
									</ProtectedRoute>
								}
							/>

							{/* Facility Owner Routes */}
							<Route
								path="/owner/dashboard"
								element={
									<ProtectedRoute allowedRoles={["facility_owner"]}>
										<OwnerDashboard />
									</ProtectedRoute>
								}
							/>

							{/* Admin Routes (Coming Soon) */}
							<Route
								path="/admin/dashboard"
								element={
									<ProtectedRoute allowedRoles={["admin"]}>
										<ComingSoon />
									</ProtectedRoute>
								}
							/>

							{/* Catch all - redirect to home */}
							<Route path="*" element={<Navigate to="/" replace />} />
						</Routes>

						<Toaster position="top-right" richColors closeButton />
					</Router>
				</AuthProvider>
			</AuthKitProvider>
		</QueryClientProvider>
	);
}

export default App;
