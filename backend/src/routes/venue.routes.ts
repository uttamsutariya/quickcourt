import { Router } from "express";
import * as venueController from "../controllers/venue.controller";
import { authenticate, authorize, optionalAuth } from "../middleware/auth.middleware";
import { UserRole } from "../types/enums";

const router = Router();

/**
 * @route   GET /api/venues
 * @desc    Get all venues with filters
 * @access  Public
 */
router.get("/", venueController.getVenues);

/**
 * @route   POST /api/venues
 * @desc    Create a new venue
 * @access  Private (Facility Owner)
 */
router.post("/", authenticate, authorize(UserRole.FACILITY_OWNER), venueController.createVenue);

/**
 * @route   GET /api/venues/my
 * @desc    Get all venues for current facility owner
 * @access  Private (Facility Owner)
 */
router.get("/my", authenticate, authorize(UserRole.FACILITY_OWNER), venueController.getMyVenues);

/**
 * @route   GET /api/venues/approved
 * @desc    Get all approved venues (public listing) - DEPRECATED
 * @access  Public
 */
router.get("/approved", venueController.getApprovedVenues);

/**
 * @route   GET /api/venues/:id
 * @desc    Get a single venue by ID
 * @access  Public (if approved) / Private (if pending/rejected)
 */
router.get("/:id", optionalAuth, venueController.getVenueById);

/**
 * @route   PUT /api/venues/:id
 * @desc    Update a venue
 * @access  Private (Owner only)
 */
router.put("/:id", authenticate, authorize(UserRole.FACILITY_OWNER), venueController.updateVenue);

/**
 * @route   DELETE /api/venues/:id
 * @desc    Delete a venue (soft delete)
 * @access  Private (Owner only)
 */
router.delete("/:id", authenticate, authorize(UserRole.FACILITY_OWNER), venueController.deleteVenue);

export default router;
