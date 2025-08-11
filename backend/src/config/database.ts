import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
	try {
		const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/quickcourt";

		const options: mongoose.ConnectOptions = {
			// Connection pool settings
			maxPoolSize: 10,
			minPoolSize: 2,

			// Timeout settings
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		};

		await mongoose.connect(mongoUri, options);

		console.log("✅ MongoDB connected successfully");
		console.log(`📍 Connected to: ${mongoose.connection.name}`);

		// Handle connection events
		mongoose.connection.on("error", (error) => {
			console.error("❌ MongoDB connection error:", error);
		});

		mongoose.connection.on("disconnected", () => {
			console.log("🔌 MongoDB disconnected");
		});

		mongoose.connection.on("reconnected", () => {
			console.log("🔄 MongoDB reconnected");
		});
	} catch (error) {
		console.error("❌ Failed to connect to MongoDB:", error);
		process.exit(1);
	}
};

export const disconnectDatabase = async (): Promise<void> => {
	try {
		await mongoose.connection.close();
		console.log("👋 MongoDB connection closed");
	} catch (error) {
		console.error("❌ Error closing MongoDB connection:", error);
	}
};

// Graceful shutdown
process.on("SIGINT", async () => {
	await disconnectDatabase();
	process.exit(0);
});

process.on("SIGTERM", async () => {
	await disconnectDatabase();
	process.exit(0);
});
