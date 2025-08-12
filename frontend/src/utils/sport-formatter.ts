// Sport enum value formatters
import { getSportName, getSportNames } from "@/config/sports";

/**
 * Format sport enum value to display label
 * @param sport - Backend enum value (e.g., "table_tennis")
 * @returns Display label (e.g., "Table Tennis")
 */
export const formatSportLabel = (sport: string): string => {
	return getSportName(sport);
};

/**
 * Format multiple sport enum values to display labels
 * @param sports - Array of backend enum values
 * @returns Array of display labels
 */
export const formatSportLabels = (sports: string[]): string[] => {
	return getSportNames(sports);
};
