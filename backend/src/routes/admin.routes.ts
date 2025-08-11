import { Router } from "express";
import {
	getAdminStats,
	getAdminVenues,
	getAdminVenueById,
	approveVenue,
	rejectVenue,
	getAllUsers,
	toggleUserStatus,
} from "../controllers/admin.controller";
import { authenticate, authorize } from "../middleware/auth.middleware";
import { UserRole } from "../types/enums";

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate, authorize(UserRole.ADMIN));

// Dashboard stats
router.get("/stats", getAdminStats);

// Venue management
router.get("/venues", getAdminVenues);
router.get("/venues/:id", getAdminVenueById);
router.put("/venues/:id/approve", approveVenue);
router.put("/venues/:id/reject", rejectVenue);

// User management
router.get("/users", getAllUsers);
router.put("/users/:id/toggle-status", toggleUserStatus);

export default router;
