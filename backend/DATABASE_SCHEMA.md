# QuickCourt Database Schema Documentation

## Overview

The QuickCourt platform uses MongoDB with Mongoose ODM for data persistence. The schema is designed to handle a multi-tenant sports facility booking system with three user roles: Users, Facility Owners, and Admins.

## Collections

### 1. Users Collection

Stores all platform users with WorkOS authentication integration.

**Key Fields:**

- `workosId`: Unique identifier from WorkOS authentication
- `role`: User role (user/facility_owner/admin)
- `email`, `name`, `avatarUrl`: User profile information
- `isActive`: Soft delete flag

**Indexes:**

- `workosId` (unique)
- `email` (unique)
- `role, isActive` (compound)

### 2. Venues Collection

Stores sports facilities managed by facility owners.

**Key Fields:**

- `ownerId`: Reference to facility owner
- `status`: Approval status (pending/approved/rejected)
- `sports`: Array of sport types available
- `amenities`: Array of facility amenities
- `images`: Cloudinary URLs for venue photos

**Indexes:**

- `ownerId, status` (compound)
- `status, isActive` (compound)
- Text index on `name, description`

### 3. Courts Collection

Stores individual courts/fields within venues.

**Key Fields:**

- `venueId`: Reference to parent venue
- `sportType`: Single sport type for this court
- `slotConfigurations`: Array of 7 configurations (one per weekday)
  - `dayOfWeek`: Day identifier
  - `isOpen`: Whether court operates on this day
  - `startTime`: Opening time (HH:MM format)
  - `slotDuration`: Duration per slot (1-4 hours)
  - `numberOfSlots`: Total slots available
  - `price`: Price per slot for this day

**Indexes:**

- `venueId, isActive` (compound)
- `venueId, sportType` (compound)

### 4. Bookings Collection

Stores all court bookings with conflict prevention.

**Key Fields:**

- `userId`, `venueId`, `courtId`: References
- `bookingDate`: Date of booking
- `startTime`, `endTime`: Booking time range
- `numberOfSlots`: Consecutive slots booked
- `status`: Booking status (confirmed/completed/cancelled)
- `totalAmount`: Calculated booking cost

**Indexes:**

- `userId, status, bookingDate` (compound)
- `courtId, bookingDate, startTime` (compound)
- Unique partial index on `courtId, bookingDate, startTime, endTime` (excluding cancelled bookings)

### 5. CourtUnavailability Collection

Manages court maintenance and private events.

**Key Fields:**

- `courtId`, `venueId`: References
- `startDateTime`, `endDateTime`: Unavailability period
- `reason`: Type of unavailability
- `isRecurring`: For weekly recurring unavailabilities
- `recurringDays`: Days of week for recurring events

**Indexes:**

- `courtId, startDateTime, endDateTime` (compound)
- `venueId, startDateTime` (compound)

### 6. AdminSettings Collection

Singleton collection for global platform settings.

**Key Fields:**

- `commissionPercentage`: Platform commission (default 10%)
- `cancellationMinHours`: Minimum hours before cancellation
- `maxBookingAdvanceDays`: How far in advance users can book

## Key Design Decisions

### 1. Time Slot Management

- **Court-based slots**: Each court has independent slot configurations
- **Weekly patterns**: 7 configurations per court (Monday-Sunday)
- **Flexible duration**: Supports 1-4 hour slots
- **Dynamic pricing**: Different prices for different days

### 2. Booking Conflict Prevention

- **Database-level uniqueness**: Partial unique index prevents double bookings
- **Pre-save validation**: Checks availability before creating booking
- **Time overlap detection**: Utility functions to detect slot conflicts

### 3. Unavailability Handling

- **Separate from bookings**: Maintenance/events stored separately
- **Recurring support**: Weekly recurring unavailabilities
- **Preserved configurations**: Week settings remain unchanged

### 4. Approval Workflow

- **Status tracking**: Venues require admin approval
- **Editable when pending**: Owners can modify pending venues
- **Soft deletes**: `isActive` flag for data preservation

## Usage Examples

### Creating a Venue with Courts

```typescript
// Create venue
const venue = await Venue.create({
	ownerId: facilityOwnerId,
	name: "Sports Complex",
	description: "Modern sports facility",
	address: {
		/* address details */
	},
	sports: [SportType.BADMINTON, SportType.TENNIS],
	amenities: ["Parking", "Changing Rooms"],
	status: VenueStatus.PENDING,
});

// Create court
const court = await Court.create({
	venueId: venue._id,
	name: "Court 1",
	sportType: SportType.BADMINTON,
	defaultPrice: 500,
	slotConfigurations: [
		/* 7 day configs */
	],
});
```

### Checking Slot Availability

```typescript
import { generateAvailableSlots } from "./utils/slotHelpers";

const date = new Date("2024-01-15");
const availableSlots = await generateAvailableSlots(courtId, date);
```

### Creating a Booking

```typescript
// Validate slot availability
const isAvailable = await Booking.isSlotAvailable(courtId, bookingDate, startTime, endTime);

if (isAvailable) {
	const booking = await Booking.create({
		userId,
		venueId,
		courtId,
		bookingDate,
		startTime,
		endTime,
		numberOfSlots: 2,
		slotDuration: SlotDuration.ONE_HOUR,
		totalAmount: 1000,
		status: BookingStatus.CONFIRMED,
	});
}
```

## Database Connection

```typescript
import { connectDatabase } from "./config/database";

// Connect to MongoDB
await connectDatabase();
```

## Environment Variables

Add to your `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/quickcourt
```

## Next Steps

1. Set up API routes for CRUD operations
2. Implement authentication middleware with WorkOS
3. Create booking validation middleware
4. Set up scheduled jobs for booking status updates
5. Implement search and filter functionality
