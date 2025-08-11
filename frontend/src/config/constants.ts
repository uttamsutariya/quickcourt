// Application constants and configuration

export const APP_NAME = "QuickCourt";
export const APP_DESCRIPTION = "Book sports facilities in your area";

export const WORKOS_CLIENT_ID = import.meta.env.VITE_WORKOS_CLIENT_ID || "";
export const WORKOS_REDIRECT_URI = import.meta.env.VITE_WORKOS_REDIRECT_URI || "http://localhost:5173/auth/callback";
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const USER_ROLES = {
	USER: "user",
	FACILITY_OWNER: "facility_owner",
	ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_NAMES = {
	[USER_ROLES.USER]: "User",
	[USER_ROLES.FACILITY_OWNER]: "Facility Owner",
	[USER_ROLES.ADMIN]: "Administrator",
} as const;
