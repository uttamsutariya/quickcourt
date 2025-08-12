// Sport types
export const SportType = {
	CRICKET: "cricket",
	BADMINTON: "badminton",
	TENNIS: "tennis",
	TABLE_TENNIS: "table_tennis",
	FOOTBALL: "football",
	BASKETBALL: "basketball",
	VOLLEYBALL: "volleyball",
	SWIMMING: "swimming",
	SQUASH: "squash",
	HOCKEY: "hockey",
	BASEBALL: "baseball",
	GOLF: "golf",
	BOXING: "boxing",
	YOGA: "yoga",
	OTHER: "other",
} as const;
export type SportType = (typeof SportType)[keyof typeof SportType];

// Days of week
export const DayOfWeek = {
	MONDAY: "monday",
	TUESDAY: "tuesday",
	WEDNESDAY: "wednesday",
	THURSDAY: "thursday",
	FRIDAY: "friday",
	SATURDAY: "saturday",
	SUNDAY: "sunday",
} as const;
export type DayOfWeek = (typeof DayOfWeek)[keyof typeof DayOfWeek];

// Slot durations
export const SlotDuration = {
	ONE_HOUR: 1,
	TWO_HOURS: 2,
	THREE_HOURS: 3,
	FOUR_HOURS: 4,
} as const;
export type SlotDuration = (typeof SlotDuration)[keyof typeof SlotDuration];

// Booking status
export const BookingStatus = {
	CONFIRMED: "confirmed",
	COMPLETED: "completed",
	CANCELLED: "cancelled",
} as const;
export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];

// Unavailability reasons
export const UnavailabilityReason = {
	MAINTENANCE: "maintenance",
	PRIVATE_EVENT: "private_event",
	HOLIDAY: "holiday",
	OTHER: "other",
} as const;
export type UnavailabilityReason = (typeof UnavailabilityReason)[keyof typeof UnavailabilityReason];

// Venue status
export const VenueStatus = {
	PENDING: "pending",
	APPROVED: "approved",
	REJECTED: "rejected",
} as const;
export type VenueStatus = (typeof VenueStatus)[keyof typeof VenueStatus];

// Venue type
export const VenueType = {
	INDOOR: "indoor",
	OUTDOOR: "outdoor",
	BOTH: "both",
} as const;
export type VenueType = (typeof VenueType)[keyof typeof VenueType];

// User roles
export const UserRole = {
	USER: "user",
	FACILITY_OWNER: "facility_owner",
	ADMIN: "admin",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
