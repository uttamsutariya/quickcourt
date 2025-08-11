# QuickCourt - Database Operations Reference

## Common Database Operations and Queries

This document provides quick reference for common database operations needed in the API development.

---

## 🔍 User Operations

### Find User by WorkOS ID

```typescript
const user = await User.findByWorkosId(workosId);
```

### Find User by Email

```typescript
const user = await User.findByEmail(email);
```

### Create New User

```typescript
const user = await User.create({
	workosId: "workos_123",
	email: "user@example.com",
	name: "John Doe",
	role: UserRole.USER,
	avatarUrl: "https://...",
});
```

### Check User Role

```typescript
if (user.isFacilityOwner()) {
	/* ... */
}
if (user.isAdmin()) {
	/* ... */
}
if (user.isUser()) {
	/* ... */
}
```

---

## 🏢 Venue Operations

### Get All Approved Venues

```typescript
const venues = await Venue.findApproved();
```

### Get Venues by Owner

```typescript
const venues = await Venue.findByOwner(ownerId);
```

### Get Pending Venues (Admin)

```typescript
const pendingVenues = await Venue.findPendingApproval();
```

### Create Venue

```typescript
const venue = await Venue.create({
	ownerId: facilityOwnerId,
	name: "Sports Complex",
	description: "Modern sports facility",
	address: {
		street: "123 Main St",
		city: "Mumbai",
		state: "Maharashtra",
		zipCode: "400001",
		country: "India",
	},
	sports: [SportType.BADMINTON, SportType.TENNIS],
	amenities: ["Parking", "Changing Rooms", "Cafeteria"],
	images: ["cloudinary_url_1", "cloudinary_url_2"],
	status: VenueStatus.PENDING,
});
```

### Approve/Reject Venue

```typescript
// Approve
venue.status = VenueStatus.APPROVED;
await venue.save();

// Reject
venue.status = VenueStatus.REJECTED;
venue.rejectionReason = "Incomplete information";
await venue.save();
```

### Get Venue with Courts

```typescript
const venue = await Venue.findById(venueId).populate("courts");
```

### Get Starting Price for Venue

```typescript
const startingPrice = await venue.getStartingPrice();
```

---

## 🏸 Court Operations

### Get Courts by Venue

```typescript
const courts = await Court.findByVenue(venueId);
```

### Get Courts by Sport

```typescript
const courts = await Court.findBySport(SportType.BADMINTON);
```

### Create Court with Default Schedule

```typescript
const court = await Court.create({
	venueId: venue._id,
	name: "Court 1",
	sportType: SportType.BADMINTON,
	description: "Indoor badminton court",
	defaultPrice: 500,
	// slotConfigurations will be auto-initialized for all 7 days
});
```

### Create Court with Custom Schedule

```typescript
const court = await Court.create({
	venueId: venue._id,
	name: "Court 2",
	sportType: SportType.TENNIS,
	defaultPrice: 800,
	slotConfigurations: [
		{
			dayOfWeek: DayOfWeek.MONDAY,
			isOpen: true,
			startTime: "06:00",
			slotDuration: SlotDuration.ONE_HOUR,
			numberOfSlots: 14,
			price: 800,
		},
		{
			dayOfWeek: DayOfWeek.TUESDAY,
			isOpen: true,
			startTime: "06:00",
			slotDuration: SlotDuration.TWO_HOURS,
			numberOfSlots: 7,
			price: 1500,
		},
		// ... remaining days
	],
});
```

### Update Court Schedule

```typescript
const court = await Court.findById(courtId);
const mondayConfig = court.slotConfigurations.find((config) => config.dayOfWeek === DayOfWeek.MONDAY);
mondayConfig.price = 600;
mondayConfig.numberOfSlots = 10;
await court.save();
```

### Check Operating Hours

```typescript
const isOpen = court.isWithinOperatingHours(new Date("2024-01-15"), "10:00", "12:00");
```

---

## 📅 Booking Operations

### Check Slot Availability

```typescript
const isAvailable = await Booking.isSlotAvailable(courtId, bookingDate, "10:00", "12:00");
```

### Create Booking

```typescript
if (isAvailable) {
	const booking = await Booking.create({
		userId: user._id,
		venueId: venue._id,
		courtId: court._id,
		bookingDate: new Date("2024-01-15"),
		startTime: "10:00",
		endTime: "12:00",
		numberOfSlots: 2,
		slotDuration: SlotDuration.ONE_HOUR,
		totalAmount: 1000,
		status: BookingStatus.CONFIRMED,
		paymentSimulated: true,
	});
}
```

### Get Bookings for a Court on Date

```typescript
const bookings = await Booking.findByCourtAndDate(courtId, new Date("2024-01-15"));
```

### Get User's Upcoming Bookings

```typescript
const upcomingBookings = await Booking.findUpcomingByUser(userId).populate("venueId").populate("courtId");
```

### Get User's Past Bookings

```typescript
const pastBookings = await Booking.findPastByUser(userId).populate("venueId").populate("courtId");
```

### Cancel Booking

```typescript
const booking = await Booking.findById(bookingId);
if (booking.canBeCancelled()) {
	await booking.cancel("Change of plans");
}
```

### Mark Booking as Completed

```typescript
await booking.markAsCompleted();
```

---

## 🚫 Court Unavailability Operations

### Mark Court Unavailable (One-time)

```typescript
const unavailability = await CourtUnavailability.create({
	courtId: court._id,
	venueId: venue._id,
	startDateTime: new Date("2024-01-15 09:00"),
	endDateTime: new Date("2024-01-15 17:00"),
	reason: UnavailabilityReason.MAINTENANCE,
	description: "Court resurfacing",
	createdBy: facilityOwner._id,
	isRecurring: false,
});
```

### Mark Court Unavailable (Recurring)

```typescript
const recurringUnavailability = await CourtUnavailability.create({
	courtId: court._id,
	venueId: venue._id,
	startDateTime: new Date("2024-01-15 13:00"),
	endDateTime: new Date("2024-01-15 14:00"),
	reason: UnavailabilityReason.PRIVATE_EVENT,
	description: "Weekly coaching class",
	createdBy: facilityOwner._id,
	isRecurring: true,
	recurringDays: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY, DayOfWeek.FRIDAY],
});
```

### Check if Slot is Unavailable

```typescript
const isUnavailable = await CourtUnavailability.isSlotUnavailable(courtId, new Date("2024-01-15"), "10:00", "11:00");
```

### Get Court Unavailabilities

```typescript
const unavailabilities = await CourtUnavailability.findByCourtId(courtId);
```

### Get Active Unavailabilities for Venue

```typescript
const activeUnavailabilities = await CourtUnavailability.findActiveByVenue(venueId);
```

---

## ⚙️ Admin Settings Operations

### Get Current Settings

```typescript
const settings = await AdminSettings.getSettings();
```

### Update Settings

```typescript
const updatedSettings = await AdminSettings.updateSettings({
	commissionPercentage: 12,
	maxBookingAdvanceDays: 14,
	cancellationMinHours: 3,
});
```

### Calculate Commission

```typescript
const settings = await AdminSettings.getSettings();
const commission = settings.calculateCommission(1000); // Returns 100 (10%)
const ownerEarnings = settings.calculateOwnerEarnings(1000); // Returns 900
```

### Check Booking Date Validity

```typescript
const settings = await AdminSettings.getSettings();
const isAllowed = settings.isBookingDateAllowed(bookingDate);
```

---

## 🔧 Utility Functions (slotHelpers.ts)

### Generate Available Slots for a Date

```typescript
import { generateAvailableSlots } from "../utils/slotHelpers";

const slots = await generateAvailableSlots(courtId, new Date("2024-01-15"));
// Returns array of IAvailableSlot with availability status
```

### Get Consecutive Slots

```typescript
import { getConsecutiveSlots } from "../utils/slotHelpers";

const consecutiveGroups = await getConsecutiveSlots(
	courtId,
	new Date("2024-01-15"),
	3, // Number of consecutive hours needed
);
// Returns array of slot groups that are consecutive and available
```

### Get Slots for Multiple Days

```typescript
import { getAvailableSlotsForDays } from "../utils/slotHelpers";

const slotsMap = await getAvailableSlotsForDays(
	courtId,
	3, // Next 3 days
);
// Returns Map with date strings as keys and slots as values
```

### Validate Booking Time

```typescript
import { validateBookingTime } from "../utils/slotHelpers";

const validation = await validateBookingTime(
	courtId,
	new Date("2024-01-15"),
	"10:00",
	"12:00",
	2, // number of slots
);

if (validation.isValid) {
	// Proceed with booking
} else {
	console.error(validation.message);
}
```

### Calculate Total Price

```typescript
import { calculateTotalPrice } from "../utils/slotHelpers";

const totalPrice = calculateTotalPrice(slots);
```

---

## 🔍 Advanced Queries

### Search Venues by Location (Geo Query)

```typescript
const nearbyVenues = await Venue.find({
	location: {
		$near: {
			$geometry: {
				type: "Point",
				coordinates: [longitude, latitude],
			},
			$maxDistance: 5000, // 5km radius
		},
	},
	status: VenueStatus.APPROVED,
	isActive: true,
});
```

### Search Venues by Text

```typescript
const venues = await Venue.find({
	$text: { $search: "badminton mumbai" },
	status: VenueStatus.APPROVED,
	isActive: true,
});
```

### Filter Venues by Sports and City

```typescript
const venues = await Venue.find({
	sports: { $in: [SportType.BADMINTON, SportType.TENNIS] },
	"address.city": "Mumbai",
	status: VenueStatus.APPROVED,
	isActive: true,
});
```

### Get Bookings for Date Range

```typescript
const bookings = await Booking.find({
	courtId: courtId,
	bookingDate: {
		$gte: startDate,
		$lte: endDate,
	},
	status: { $ne: BookingStatus.CANCELLED },
}).sort({ bookingDate: 1, startTime: 1 });
```

### Aggregate Booking Statistics

```typescript
const stats = await Booking.aggregate([
	{
		$match: {
			venueId: venueId,
			status: BookingStatus.COMPLETED,
			bookingDate: {
				$gte: new Date("2024-01-01"),
				$lte: new Date("2024-01-31"),
			},
		},
	},
	{
		$group: {
			_id: null,
			totalBookings: { $sum: 1 },
			totalRevenue: { $sum: "$totalAmount" },
			avgBookingValue: { $avg: "$totalAmount" },
		},
	},
]);
```

---

## 🔐 Transactions (For Critical Operations)

### Booking Creation with Transaction

```typescript
const session = await mongoose.startSession();
session.startTransaction();

try {
	// Check availability
	const isAvailable = await Booking.isSlotAvailable(courtId, bookingDate, startTime, endTime);

	if (!isAvailable) {
		throw new Error("Slot not available");
	}

	// Create booking
	const booking = await Booking.create(
		[
			{
				userId,
				venueId,
				courtId,
				bookingDate,
				startTime,
				endTime,
				// ... other fields
			},
		],
		{ session },
	);

	// Update any related records if needed

	await session.commitTransaction();
	return booking[0];
} catch (error) {
	await session.abortTransaction();
	throw error;
} finally {
	session.endSession();
}
```

---

## 📝 Notes

- Always use `.populate()` when you need related documents
- Add `.lean()` for read-only queries to improve performance
- Use `.select()` to limit fields returned
- Remember to handle errors with try-catch blocks
- Validate user permissions before database operations
- Use indexes for frequently queried fields
- Consider pagination for list endpoints

---

_This reference should be updated as new operations are added during development._
