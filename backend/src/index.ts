import express from "express";
import cors from "cors";
import { config } from "./config/env";

const app = express();

// Create HTTP server
const server = require("http").createServer(app);

// Middleware
app.use(
	cors({
		origin: config.frontendUrl,
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.isDevelopment) {
	app.use((req, _res, next) => {
		console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
		next();
	});
}

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		error: "Not Found",
		message: `Route ${req.method} ${req.path} not found`,
	});
});

const startServer = async () => {
	try {
		server.listen(config.port, () => {
			console.log(`🚀 Server is running on port ${config.port}`);
			console.log(`📍 Environment: ${config.nodeEnv}`);
			console.log(`🌐 Frontend URL: ${config.frontendUrl}`);
		});

		server.on("error", (error: NodeJS.ErrnoException) => {
			if (error.code === "EADDRINUSE") {
				console.error(`Port ${config.port} is already in use`);
			} else {
				console.error("Server error:", error);
			}
			process.exit(1);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

startServer();

const shutdown = async () => {
	console.log("\nShutting down gracefully...");

	try {
		await new Promise<void>((resolve, reject) => {
			server.close((err: Error) => {
				if (err) {
					console.error("Error closing server:", err);
					reject(err);
				} else {
					console.log("Server closed");
					resolve();
				}
			});
		});
	} catch (error) {
		console.error("Error during shutdown:", error);
		process.exit(1);
	}
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
	console.error("Uncaught Exception:", error);
	shutdown();
});

export default app;
