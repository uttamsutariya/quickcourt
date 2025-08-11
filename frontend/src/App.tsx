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

// Layout Components
import OwnerLayout from "@/components/owner/OwnerLayout";
import UserLayout from "@/components/user/UserLayout";
import AdminLayout from "@/components/admin/AdminLayout";

// Protected Pages
import OwnerDashboard from "@/pages/owner/OwnerDashboard";
import MyVenues from "@/pages/owner/MyVenues";
import CreateVenue from "@/pages/owner/CreateVenue";
import EditVenue from "@/pages/owner/EditVenue";
import OwnerBookings from "@/pages/owner/OwnerBookings";
import VenueDetails from "@/pages/venue/VenueDetails";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import FacilityApproval from "@/pages/admin/FacilityApproval";
import ComingSoon from "@/pages/ComingSoon";
import UserDashboard from "@/pages/user/UserDashboard";
import UserBookings from "@/pages/user/UserBookings";
import Profile from "@/pages/shared/Profile";

// Public Pages
import Landing from "@/pages/Landing";
import BrowseVenues from "@/pages/BrowseVenues";

// Components
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AppInitializer from "@/components/auth/AppInitializer";
import PublicLayout from "@/components/public/PublicLayout";
import { AuthProvider } from "@/providers/AuthProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import AdminVenueDetails from "./pages/admin/AdminVenueDetails";

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
		<ThemeProvider defaultTheme="dark">
			<QueryClientProvider client={queryClient}>
				<AuthKitProvider clientId={WORKOS_CLIENT_ID} redirectUri={WORKOS_REDIRECT_URI}>
					<AuthProvider>
						<AppInitializer>
							<Router>
								<Routes>
									{/* Public Routes with Layout */}
									<Route element={<PublicLayout />}>
										<Route path="/" element={<Landing />} />
										<Route path="/venues" element={<BrowseVenues />} />
										<Route path="/venues/:id" element={<VenueDetails />} />
									</Route>

									{/* Auth Routes (no layout) */}
									<Route path="/auth/login" element={<Login />} />
									<Route path="/auth/role-selection" element={<RoleSelection />} />
									<Route path="/auth/callback" element={<AuthCallback />} />

									{/* User Routes */}
									<Route
										path="/user"
										element={
											<ProtectedRoute allowedRoles={["user"]}>
												<UserLayout />
											</ProtectedRoute>
										}
									>
										<Route path="dashboard" element={<UserDashboard />} />
										<Route path="bookings" element={<UserBookings />} />
										<Route path="profile" element={<Profile />} />
										<Route index element={<Navigate to="/user/dashboard" replace />} />
									</Route>

									{/* Facility Owner Routes */}
									<Route
										path="/owner"
										element={
											<ProtectedRoute allowedRoles={["facility_owner"]}>
												<OwnerLayout />
											</ProtectedRoute>
										}
									>
										<Route path="dashboard" element={<OwnerDashboard />} />
										<Route path="venues" element={<MyVenues />} />
										<Route path="venues/new" element={<CreateVenue />} />
										<Route path="venues/:id" element={<VenueDetails />} />
										<Route path="venues/:id/edit" element={<EditVenue />} />
										<Route path="bookings" element={<OwnerBookings />} />
										<Route path="profile" element={<Profile />} />
										<Route index element={<Navigate to="/owner/dashboard" replace />} />
									</Route>

									{/* Admin Routes */}
									<Route
										path="/admin"
										element={
											<ProtectedRoute allowedRoles={["admin"]}>
												<AdminLayout />
											</ProtectedRoute>
										}
									>
										<Route path="dashboard" element={<AdminDashboard />} />
										<Route path="venues/approval" element={<FacilityApproval />} />
										<Route path="venues/:id" element={<AdminVenueDetails />} />
										<Route path="users" element={<ComingSoon />} />
										<Route path="bookings" element={<ComingSoon />} />
										<Route path="profile" element={<Profile />} />
										<Route index element={<Navigate to="/admin/dashboard" replace />} />
									</Route>

									{/* Catch all - redirect to home */}
									<Route path="*" element={<Navigate to="/" replace />} />
								</Routes>

								<Toaster position="top-right" richColors closeButton />
							</Router>
						</AppInitializer>
					</AuthProvider>
				</AuthKitProvider>
			</QueryClientProvider>
		</ThemeProvider>
	);
}

export default App;
