// Enums for the QuickCourt application

export enum UserRole {
	USER = "user",
	FACILITY_OWNER = "facility_owner",
	ADMIN = "admin",
}

export enum VenueStatus {
	PENDING = "pending",
	APPROVED = "approved",
	REJECTED = "rejected",
}

export enum BookingStatus {
	CONFIRMED = "confirmed",
	COMPLETED = "completed",
	CANCELLED = "cancelled",
}

export enum DayOfWeek {
	MONDAY = "monday",
	TUESDAY = "tuesday",
	WEDNESDAY = "wednesday",
	THURSDAY = "thursday",
	FRIDAY = "friday",
	SATURDAY = "saturday",
	SUNDAY = "sunday",
}

export enum SportType {
	CRICKET = "cricket",
	BADMINTON = "badminton",
	TENNIS = "tennis",
	TABLE_TENNIS = "table_tennis",
	FOOTBALL = "football",
	BASKETBALL = "basketball",
	VOLLEYBALL = "volleyball",
	SWIMMING = "swimming",
	SQUASH = "squash",
	HOCKEY = "hockey",
	BASEBALL = "baseball",
	GOLF = "golf",
	BOXING = "boxing",
	GYM_FITNESS = "gym_fitness",
	YOGA = "yoga",
	OTHER = "other",
}

export enum UnavailabilityReason {
	MAINTENANCE = "maintenance",
	PRIVATE_EVENT = "private_event",
	HOLIDAY = "holiday",
	OTHER = "other",
}

export enum SlotDuration {
	ONE_HOUR = 1,
	TWO_HOURS = 2,
	THREE_HOURS = 3,
	FOUR_HOURS = 4,
}
