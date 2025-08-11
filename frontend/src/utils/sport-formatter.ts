// Sport enum value formatters

// Map backend enum values to display labels
const SPORT_LABELS: Record<string, string> = {
	cricket: "Cricket",
	badminton: "Badminton",
	tennis: "Tennis",
	table_tennis: "Table Tennis",
	football: "Football",
	basketball: "Basketball",
	volleyball: "Volleyball",
	swimming: "Swimming",
	squash: "Squash",
	hockey: "Hockey",
	baseball: "Baseball",
	golf: "Golf",
	boxing: "Boxing",
	gym_fitness: "Gym/Fitness",
	yoga: "Yoga",
	other: "Other",
};

/**
 * Format sport enum value to display label
 * @param sport - Backend enum value (e.g., "table_tennis")
 * @returns Display label (e.g., "Table Tennis")
 */
export const formatSportLabel = (sport: string): string => {
	return SPORT_LABELS[sport] || sport;
};

/**
 * Format multiple sport enum values to display labels
 * @param sports - Array of backend enum values
 * @returns Array of display labels
 */
export const formatSportLabels = (sports: string[]): string[] => {
	return sports.map(formatSportLabel);
};
