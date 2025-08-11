import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
	createBooking,
	getUserBookings,
	getVenueBookings,
	getOwnerBookings,
	getOwnerDashboardStats,
	getBookingDetails,
	cancelBooking,
} from "../controllers/booking.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Booking operations
router.post("/", createBooking);
router.get("/user", getUserBookings);
router.get("/owner/stats", getOwnerDashboardStats);
router.get("/owner", getOwnerBookings);
router.get("/venue/:venueId", getVenueBookings);
router.get("/:bookingId", getBookingDetails);
router.patch("/:bookingId/cancel", cancelBooking);

export default router;
