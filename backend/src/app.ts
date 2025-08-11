import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";

// Import routes
import authRoutes from "./routes/auth.routes";
import uploadRoutes from "./routes/upload.routes";
import venueRoutes from "./routes/venue.routes";
import adminRoutes from "./routes/admin.routes";
import courtRoutes from "./routes/court.routes";
import bookingRoutes from "./routes/booking.routes";

// Create Express app
const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
	cors({
		origin: config.cors.origin,
		credentials: config.cors.credentials,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
	}),
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware (only in development)
if (config.nodeEnv === "development") {
	app.use(morgan("dev"));
}

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
	res.json({
		success: true,
		message: "QuickCourt API is running",
		timestamp: new Date().toISOString(),
		environment: config.nodeEnv,
	});
});

// API routes
app.use(`${config.app.apiPrefix}/auth`, authRoutes);
app.use(`${config.app.apiPrefix}/upload`, uploadRoutes);
app.use(`${config.app.apiPrefix}/venues`, venueRoutes);
app.use(`${config.app.apiPrefix}/admin`, adminRoutes);
app.use(`${config.app.apiPrefix}/venues/:venueId/courts`, courtRoutes);
app.use(`${config.app.apiPrefix}/bookings`, bookingRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		message: "Route not found",
	});
});

// Global error handler
app.use(errorHandler);

export default app;
