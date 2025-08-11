import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
	getCourtsByVenue,
	createCourt,
	getCourtDetails,
	updateCourt,
	deleteCourt,
	getCourtAvailability,
	markCourtUnavailable,
	removeCourtUnavailability,
} from "../controllers/court.controller";

const router = Router({ mergeParams: true }); // mergeParams to access :venueId from parent route

// All routes require authentication
router.use(authenticate);

// Court CRUD operations
router.get("/", getCourtsByVenue);
router.post("/", createCourt);
router.get("/:courtId", getCourtDetails);
router.put("/:courtId", updateCourt);
router.delete("/:courtId", deleteCourt);

// Availability management
router.get("/:courtId/availability", getCourtAvailability);
router.post("/:courtId/unavailability", markCourtUnavailable);
router.delete("/:courtId/unavailability/:unavailabilityId", removeCourtUnavailability);

export default router;
