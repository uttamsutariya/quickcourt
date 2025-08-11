import apiClient from "@/lib/api-client";

export interface Address {
	street: string;
	city: string;
	state: string;
	zipCode: string;
	country: string;
}

export interface Location {
	type: string;
	coordinates: [number, number];
}

export interface Venue {
	_id?: string;
	ownerId?: string;
	name: string;
	description: string;
	address: Address;
	location?: Location;
	sports: string[];
	amenities: string[];
	images: string[];
	status?: string;
	isActive?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface VenueListResponse {
	success: boolean;
	venues: Venue[];
	pagination?: {
		total: number;
		page: number;
		pages: number;
		limit: number;
	};
}

export interface VenueResponse {
	success: boolean;
	venue: Venue;
	message?: string;
}

class VenueService {
	async createVenue(data: Partial<Venue>): Promise<VenueResponse> {
		const response = await apiClient.post<VenueResponse>("/venues", data);
		return response.data;
	}

	async getMyVenues(): Promise<VenueListResponse> {
		const response = await apiClient.get<VenueListResponse>("/venues/my");
		return response.data;
	}

	async getVenueById(id: string): Promise<VenueResponse> {
		const response = await apiClient.get<VenueResponse>(`/venues/${id}`);
		return response.data;
	}

	async updateVenue(id: string, data: Partial<Venue>): Promise<VenueResponse> {
		const response = await apiClient.put<VenueResponse>(`/venues/${id}`, data);
		return response.data;
	}

	async deleteVenue(id: string): Promise<{ success: boolean; message: string }> {
		const response = await apiClient.delete(`/venues/${id}`);
		return response.data;
	}

	async getApprovedVenues(params?: {
		search?: string;
		sports?: string[];
		city?: string;
		page?: number;
		limit?: number;
	}): Promise<VenueListResponse> {
		const response = await apiClient.get<VenueListResponse>("/venues/approved", { params });
		return response.data;
	}
}

export default new VenueService();
