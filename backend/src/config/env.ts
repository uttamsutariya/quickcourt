import dotenv from "dotenv";

// Load environment variables
dotenv.config();

export const config = {
	// Server Configuration
	port: process.env.PORT || 3000,
	nodeEnv: process.env.NODE_ENV || "development",

	// Database Configuration
	mongodb: {
		uri: process.env.MONGODB_URI || "mongodb://localhost:27017/quickcourt",
	},

	// WorkOS Configuration
	workos: {
		apiKey: process.env.WORKOS_API_KEY || "",
		clientId: process.env.WORKOS_CLIENT_ID || "",
		webhookSecret: process.env.WORKOS_WEBHOOK_SECRET || "",
	},

	// Cloudinary Configuration (for future use)
	cloudinary: {
		cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
		apiKey: process.env.CLOUDINARY_API_KEY || "",
		apiSecret: process.env.CLOUDINARY_API_SECRET || "",
	},

	// Application Settings
	app: {
		name: "QuickCourt",
		frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
		apiPrefix: "/api",
	},

	// Security
	cors: {
		origin: process.env.FRONTEND_URL || "http://localhost:5173",
		credentials: true,
	},
} as const;

// Validate required environment variables
const requiredEnvVars = ["MONGODB_URI", "WORKOS_API_KEY", "WORKOS_CLIENT_ID"];

for (const envVar of requiredEnvVars) {
	if (!process.env[envVar]) {
		console.warn(`Warning: ${envVar} is not set in environment variables`);
	}
}
