import dotenv from "dotenv";
import app from "./app";
import { config } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";

// Load environment variables
dotenv.config();

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
	console.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
	console.error(err.name, err.message);
	process.exit(1);
});

// Start server
const startServer = async () => {
	try {
		// Connect to MongoDB
		await connectDatabase();

		// Start Express server
		const server = app.listen(config.port, () => {
			console.log(`🚀 Server is running on port ${config.port}`);
			console.log(`📍 Environment: ${config.nodeEnv}`);
			console.log(`🔗 Health check: http://localhost:${config.port}/health`);
		});

		// Handle unhandled promise rejections
		process.on("unhandledRejection", (err: Error) => {
			console.error("UNHANDLED REJECTION! 💥 Shutting down...");
			console.error(err.name, err.message);
			server.close(() => {
				disconnectDatabase();
				process.exit(1);
			});
		});

		// Handle graceful shutdown
		process.on("SIGTERM", () => {
			console.log("👋 SIGTERM RECEIVED. Shutting down gracefully");
			server.close(() => {
				disconnectDatabase();
				console.log("💥 Process terminated!");
			});
		});

		process.on("SIGINT", () => {
			console.log("👋 SIGINT RECEIVED. Shutting down gracefully");
			server.close(() => {
				disconnectDatabase();
				console.log("💥 Process terminated!");
			});
		});
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

// Start the application
startServer();
