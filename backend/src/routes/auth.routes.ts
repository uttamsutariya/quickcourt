import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

/**
 * @route   GET /api/auth/me
 * @desc    Get current authenticated user
 * @access  Private
 */
router.get("/me", authenticate, authController.getCurrentUser);

/**
 * @route   POST /api/auth/users
 * @desc    Create or update user after WorkOS authentication
 * @access  Public (called from frontend after WorkOS auth)
 */
router.post("/users", authController.createOrUpdateUser);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put("/profile", authenticate, authController.updateProfile);

/**
 * @route   POST /api/auth/verify
 * @desc    Verify WorkOS token (for testing/debugging)
 * @access  Public
 */
router.post("/verify", authController.verifyToken);

export default router;
