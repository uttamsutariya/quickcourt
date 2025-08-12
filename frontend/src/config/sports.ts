/**
 * Centralized sports configuration to ensure consistency across the application
 * This file maps backend enum values to display information
 */

export interface SportConfig {
	id: string; // Backend enum value
	name: string; // Display name
	image: string; // Image path
	description: string; // Description for cards/tooltips
}

/**
 * Complete sports configuration mapping backend enum values to display data
 * IMPORTANT: The `id` field must exactly match the backend SportType enum values
 */
export const SPORTS_CONFIG: SportConfig[] = [
	{
		id: "cricket",
		name: "Cricket",
		image: "/assets/cricket.jpg",
		description: "Book cricket pitches and nets",
	},
	{
		id: "football",
		name: "Football",
		image: "/assets/football.jpg",
		description: "Find football fields near you",
	},
	{
		id: "badminton",
		name: "Badminton",
		image: "/assets/badminton.jpg",
		description: "Indoor and outdoor courts",
	},
	{
		id: "swimming",
		name: "Swimming",
		image: "/assets/swimming.jpg",
		description: "Swimming pools and aquatic centers",
	},
	{
		id: "tennis",
		name: "Tennis",
		image: "/assets/tennis.jpg",
		description: "Professional tennis courts",
	},
	{
		id: "basketball",
		name: "Basketball",
		image: "/assets/basket_ball.jpg",
		description: "Indoor and outdoor basketball courts",
	},
	{
		id: "volleyball",
		name: "Volleyball",
		image: "/assets/volleyball.jpg",
		description: "Beach and indoor volleyball courts",
	},
	{
		id: "table_tennis",
		name: "Table Tennis",
		image: "/assets/table_tennis.jpg",
		description: "Table tennis halls and clubs",
	},
	{
		id: "hockey",
		name: "Hockey",
		image: "/assets/hockey.jpg",
		description: "Hockey fields and rinks",
	},
	{
		id: "baseball",
		name: "Baseball",
		image: "/assets/baseball.jpg",
		description: "Baseball diamonds and batting cages",
	},
	{
		id: "squash",
		name: "Squash",
		image: "/assets/cricket.jpg", // Fallback image
		description: "Indoor squash courts",
	},
	{
		id: "golf",
		name: "Golf",
		image: "/assets/cricket.jpg", // Fallback image
		description: "Golf courses and driving ranges",
	},
	{
		id: "boxing",
		name: "Boxing",
		image: "/assets/cricket.jpg", // Fallback image
		description: "Boxing gyms and training facilities",
	},
	{
		id: "yoga",
		name: "Yoga",
		image: "/assets/cricket.jpg", // Fallback image
		description: "Yoga studios and wellness centers",
	},
	{
		id: "other",
		name: "Other",
		image: "/assets/cricket.jpg", // Fallback image
		description: "Other sports and activities",
	},
];

/**
 * Popular sports for display on landing page and browse page
 * Subset of all available sports
 */
export const POPULAR_SPORTS = SPORTS_CONFIG.filter((sport) =>
	[
		"cricket",
		"football",
		"badminton",
		"swimming",
		"tennis",
		"basketball",
		"volleyball",
		"table_tennis",
		"hockey",
		"baseball",
	].includes(sport.id),
);

/**
 * Sports options for venue creation/editing forms
 * Maps to backend enum values with display labels
 */
export const SPORTS_FORM_OPTIONS = SPORTS_CONFIG.map((sport) => ({
	value: sport.id, // Backend enum value
	label: sport.name, // Display label
}));

/**
 * Get sport configuration by ID
 */
export const getSportConfig = (sportId: string): SportConfig | undefined => {
	return SPORTS_CONFIG.find((sport) => sport.id === sportId);
};

/**
 * Get sport display name by ID
 */
export const getSportName = (sportId: string): string => {
	const config = getSportConfig(sportId);
	return config?.name || sportId;
};

/**
 * Validate if a sport ID exists in our configuration
 */
export const isValidSportId = (sportId: string): boolean => {
	return SPORTS_CONFIG.some((sport) => sport.id === sportId);
};

/**
 * Get multiple sport names by IDs
 */
export const getSportNames = (sportIds: string[]): string[] => {
	return sportIds.map(getSportName);
};
