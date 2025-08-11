import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "@/lib/api-client";
import type { UserRole } from "@/config/constants";

interface User {
	_id: string;
	workosId: string;
	email: string;
	name: string;
	avatarUrl?: string;
	role: UserRole;
	phoneNumber?: string;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

interface AuthState {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	selectedRole: UserRole | null;

	// Actions
	setUser: (user: User | null) => void;
	setLoading: (loading: boolean) => void;
	setSelectedRole: (role: UserRole | null) => void;
	fetchCurrentUser: () => Promise<void>;
	createOrUpdateUser: (userData: Partial<User>) => Promise<void>;
	logout: () => void;
	clearSelectedRole: () => void;
}

const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			isLoading: false,
			isAuthenticated: false,
			selectedRole: null,

			setUser: (user) =>
				set({
					user,
					isAuthenticated: !!user,
				}),

			setLoading: (isLoading) => set({ isLoading }),

			setSelectedRole: (selectedRole) => set({ selectedRole }),

			clearSelectedRole: () => set({ selectedRole: null }),

			fetchCurrentUser: async () => {
				try {
					set({ isLoading: true });
					const response = await apiClient.get("/auth/me");
					set({
						user: response.data.user,
						isAuthenticated: true,
					});
				} catch (error) {
					console.error("Error fetching current user:", error);
					set({
						user: null,
						isAuthenticated: false,
					});
				} finally {
					set({ isLoading: false });
				}
			},

			createOrUpdateUser: async (userData) => {
				try {
					set({ isLoading: true });
					console.log("Creating or updating user:", userData);

					// Include the selected role if it exists
					const selectedRole = get().selectedRole;
					const dataToSend = selectedRole ? { ...userData, role: selectedRole } : userData;

					console.log("Data to send:", dataToSend);

					const response = await apiClient.post("/auth/users", dataToSend);

					console.log("Response:", response);

					set({
						user: response.data.user,
						isAuthenticated: true,
						selectedRole: null, // Clear selected role after successful creation
					});
				} catch (error) {
					console.error("Error creating/updating user:", error);
					throw error;
				} finally {
					set({ isLoading: false });
				}
			},

			logout: () => {
				set({
					user: null,
					isAuthenticated: false,
					selectedRole: null,
				});
				// Clear any persisted data
				localStorage.removeItem("auth-storage");
			},
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
				selectedRole: state.selectedRole, // Persist selected role through redirects
			}),
		},
	),
);

export default useAuthStore;
