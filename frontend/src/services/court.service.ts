import apiClient from "@/lib/api-client";
import { SportType, DayOfWeek, SlotDuration, UnavailabilityReason } from "@/types/enums";

// Court interfaces
export interface SlotConfiguration {
	dayOfWeek: DayOfWeek;
	isOpen: boolean;
	startTime: string;
	slotDuration: SlotDuration;
	numberOfSlots: number;
	price: number;
}

export interface Court {
	_id?: string;
	venueId: string;
	name: string;
	sportType: SportType;
	description?: string;
	defaultPrice: number;
	slotConfigurations: SlotConfiguration[];
	isActive: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface CourtUnavailability {
	_id?: string;
	courtId: string;
	venueId: string;
	startDateTime: string;
	endDateTime: string;
	reason: UnavailabilityReason;
	description?: string;
	isRecurring: boolean;
	recurringDays?: DayOfWeek[];
	createdBy: string;
}

export interface AvailableSlot {
	startTime: string;
	endTime: string;
	isAvailable: boolean;
	price: number;
}

export interface CourtAvailability {
	courtId: string;
	availability: {
		[date: string]: AvailableSlot[];
	};
}

// Court service
class CourtService {
	// Get all courts for a venue
	async getCourtsByVenue(venueId: string): Promise<Court[]> {
		const response = await apiClient.get(`/venues/${venueId}/courts`);
		return response.data.courts;
	}

	// Create a new court
	async createCourt(venueId: string, courtData: Partial<Court>): Promise<Court> {
		const response = await apiClient.post(`/venues/${venueId}/courts`, courtData);
		return response.data.court;
	}

	// Get court details
	async getCourtDetails(venueId: string, courtId: string): Promise<Court> {
		const response = await apiClient.get(`/venues/${venueId}/courts/${courtId}`);
		return response.data.court;
	}

	// Update court
	async updateCourt(venueId: string, courtId: string, updates: Partial<Court>): Promise<Court> {
		const response = await apiClient.put(`/venues/${venueId}/courts/${courtId}`, updates);
		return response.data.court;
	}

	// Delete court (soft delete)
	async deleteCourt(venueId: string, courtId: string): Promise<void> {
		await apiClient.delete(`/venues/${venueId}/courts/${courtId}`);
	}

	// Get court availability
	async getCourtAvailability(
		venueId: string,
		courtId: string,
		params?: { startDate?: string; endDate?: string; days?: number },
	): Promise<CourtAvailability> {
		const response = await apiClient.get(`/venues/${venueId}/courts/${courtId}/availability`, { params });
		return response.data;
	}

	// Mark court as unavailable
	async markCourtUnavailable(
		venueId: string,
		courtId: string,
		unavailabilityData: Partial<CourtUnavailability>,
	): Promise<CourtUnavailability> {
		const response = await apiClient.post(`/venues/${venueId}/courts/${courtId}/unavailability`, unavailabilityData);
		return response.data.unavailability;
	}

	// Remove court unavailability
	async removeCourtUnavailability(venueId: string, courtId: string, unavailabilityId: string): Promise<void> {
		await apiClient.delete(`/venues/${venueId}/courts/${courtId}/unavailability/${unavailabilityId}`);
	}

	// Helper method to generate default slot configurations
	generateDefaultSlotConfigurations(defaultPrice: number = 500): SlotConfiguration[] {
		const days = [
			DayOfWeek.MONDAY,
			DayOfWeek.TUESDAY,
			DayOfWeek.WEDNESDAY,
			DayOfWeek.THURSDAY,
			DayOfWeek.FRIDAY,
			DayOfWeek.SATURDAY,
			DayOfWeek.SUNDAY,
		];

		return days.map((day) => ({
			dayOfWeek: day,
			isOpen: true,
			startTime: "10:00",
			slotDuration: SlotDuration.ONE_HOUR,
			numberOfSlots: 11, // 10 AM to 9 PM
			price: defaultPrice,
		}));
	}

	// Helper to copy configuration from one day to others
	copyDayConfiguration(sourceConfig: SlotConfiguration, targetDays: DayOfWeek[]): SlotConfiguration[] {
		return targetDays.map((day) => ({
			...sourceConfig,
			dayOfWeek: day,
		}));
	}

	// Validate slot configuration
	validateSlotConfiguration(config: SlotConfiguration): { isValid: boolean; error?: string } {
		if (!config.startTime || !config.startTime.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
			return { isValid: false, error: "Invalid start time format" };
		}

		const [hours] = config.startTime.split(":").map(Number);
		const totalHours = config.slotDuration * config.numberOfSlots;
		const endHour = hours + totalHours;

		if (endHour > 24) {
			return { isValid: false, error: "End time exceeds 24 hours" };
		}

		if (config.numberOfSlots < 1) {
			return { isValid: false, error: "Number of slots must be at least 1" };
		}

		if (config.price < 0) {
			return { isValid: false, error: "Price cannot be negative" };
		}

		return { isValid: true };
	}
}

export default new CourtService();
