import { Request, Response } from "express";
import { Venue } from "../models";
import { NotFoundError, ForbiddenError } from "../utils/errors";
import { VenueStatus, UserRole } from "../types/enums";

/**
 * Create a new venue
 */
export const createVenue = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			throw new ForbiddenError("Authentication required");
		}

		// Only facility owners can create venues
		if (req.user.role !== UserRole.FACILITY_OWNER) {
			throw new ForbiddenError("Only facility owners can create venues");
		}

		// Extract location from request body to handle it separately
		const { location, ...restBody } = req.body;

		const venueData: any = {
			...restBody,
			ownerId: req.user._id,
			status: VenueStatus.PENDING, // Always start as pending
		};

		// Only add location if coordinates are provided
		if (location && location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length === 2) {
			venueData.location = {
				type: "Point",
				coordinates: location.coordinates,
			};
		}

		const venue = await Venue.create(venueData);

		res.status(201).json({
			success: true,
			venue,
			message: "Venue created successfully and pending admin approval",
		});
	} catch (error: any) {
		console.error("Create venue error:", error);
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to create venue",
		});
	}
};

/**
 * Get all venues for the current facility owner
 */
export const getMyVenues = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			throw new ForbiddenError("Authentication required");
		}

		const venues = await Venue.find({
			ownerId: req.user._id,
			isActive: true,
		}).sort({ createdAt: -1 });

		res.json({
			success: true,
			venues,
		});
	} catch (error: any) {
		console.error("Get my venues error:", error);
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to fetch venues",
		});
	}
};

/**
 * Get a single venue by ID
 */
export const getVenueById = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;

		const venue = await Venue.findById(id).populate("ownerId", "name email").populate("courts");

		if (!venue || !venue.isActive) {
			throw new NotFoundError("Venue not found");
		}

		// Check if user has permission to view this venue
		if (req.user) {
			const isOwner = venue.ownerId._id.toString() === req.user._id.toString();
			const isAdmin = req.user.role === UserRole.ADMIN;
			const isApproved = venue.status === VenueStatus.APPROVED;

			// Only owner, admin, or anyone (if approved) can view
			if (!isOwner && !isAdmin && !isApproved) {
				throw new ForbiddenError("You don't have permission to view this venue");
			}
		} else if (venue.status !== VenueStatus.APPROVED) {
			// Non-authenticated users can only view approved venues
			throw new ForbiddenError("This venue is not publicly available");
		}

		res.json({
			success: true,
			venue,
		});
	} catch (error: any) {
		console.error("Get venue by ID error:", error);
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to fetch venue",
		});
	}
};

/**
 * Update a venue
 */
export const updateVenue = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			throw new ForbiddenError("Authentication required");
		}

		const { id } = req.params;
		const venue = await Venue.findById(id);

		if (!venue || !venue.isActive) {
			throw new NotFoundError("Venue not found");
		}

		// Only owner can update
		if (venue.ownerId.toString() !== req.user._id.toString()) {
			throw new ForbiddenError("You don't have permission to update this venue");
		}

		// Don't allow status changes through this endpoint
		const { status, ownerId, location, ...updateData } = req.body;

		// Handle location separately
		if (location !== undefined) {
			if (
				location &&
				location.coordinates &&
				Array.isArray(location.coordinates) &&
				location.coordinates.length === 2
			) {
				// Valid location provided
				updateData.location = {
					type: "Point",
					coordinates: location.coordinates,
				};
			} else if (location === null) {
				// Explicitly remove location
				updateData.location = undefined;
			}
			// If location is invalid, ignore it
		}

		Object.assign(venue, updateData);
		await venue.save();

		res.json({
			success: true,
			venue,
			message: "Venue updated successfully",
		});
	} catch (error: any) {
		console.error("Update venue error:", error);
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to update venue",
		});
	}
};

/**
 * Delete a venue (soft delete)
 */
export const deleteVenue = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			throw new ForbiddenError("Authentication required");
		}

		const { id } = req.params;
		const venue = await Venue.findById(id);

		if (!venue || !venue.isActive) {
			throw new NotFoundError("Venue not found");
		}

		// Only owner can delete
		if (venue.ownerId.toString() !== req.user._id.toString()) {
			throw new ForbiddenError("You don't have permission to delete this venue");
		}

		// Soft delete
		venue.isActive = false;
		await venue.save();

		res.json({
			success: true,
			message: "Venue deleted successfully",
		});
	} catch (error: any) {
		console.error("Delete venue error:", error);
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to delete venue",
		});
	}
};

/**
 * Get all approved venues (public endpoint)
 */
export const getApprovedVenues = async (req: Request, res: Response) => {
	try {
		const { search, sports, city, page = 1, limit = 10 } = req.query;

		const query: any = {
			status: VenueStatus.APPROVED,
			isActive: true,
		};

		// Add search filter
		if (search) {
			query.$or = [{ name: { $regex: search, $options: "i" } }, { description: { $regex: search, $options: "i" } }];
		}

		// Add sports filter
		if (sports) {
			const sportsArray = Array.isArray(sports) ? sports : [sports];
			query.sports = { $in: sportsArray };
		}

		// Add city filter
		if (city) {
			query["address.city"] = { $regex: city, $options: "i" };
		}

		const skip = (Number(page) - 1) * Number(limit);

		const venues = await Venue.find(query)
			.populate("ownerId", "name")
			.skip(skip)
			.limit(Number(limit))
			.sort({ createdAt: -1 });

		const total = await Venue.countDocuments(query);

		res.json({
			success: true,
			venues,
			pagination: {
				total,
				page: Number(page),
				pages: Math.ceil(total / Number(limit)),
				limit: Number(limit),
			},
		});
	} catch (error: any) {
		console.error("Get approved venues error:", error);
		res.status(error.statusCode || 500).json({
			success: false,
			message: error.message || "Failed to fetch venues",
		});
	}
};
