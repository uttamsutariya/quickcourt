import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { API_URL } from "@/config/constants";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
	baseURL: API_URL,
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
});

// Function to get access token from WorkOS
let getAccessTokenFn: (() => Promise<string | null>) | null = null;

// Export function to set the access token getter
export const setAccessTokenGetter = (fn: () => Promise<string | null>) => {
	getAccessTokenFn = fn;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
	async (config: InternalAxiosRequestConfig) => {
		// Get the access token from WorkOS
		try {
			if (getAccessTokenFn) {
				const accessToken = await getAccessTokenFn();

				if (accessToken) {
					config.headers.Authorization = `Bearer ${accessToken}`;
				}
			}
		} catch (error) {
			console.error("Error getting access token:", error);
		}

		return config;
	},
	(error: AxiosError) => {
		return Promise.reject(error);
	},
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		if (error.response?.status === 401) {
			// Token expired or invalid, redirect to login
			window.location.href = "/auth/login";
		}

		// Format error message
		const message = (error.response?.data as any)?.message || error.message || "An unexpected error occurred";

		return Promise.reject(new Error(message));
	},
);

export default apiClient;
