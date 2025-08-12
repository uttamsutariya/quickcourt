/**
 * Sport validation utilities to ensure data consistency
 */

import { SPORTS_CONFIG, isValidSportId } from "@/config/sports";

/**
 * Validate that all sport IDs in an array are valid
 * @param sportIds - Array of sport IDs to validate
 * @returns Object with validation result and invalid IDs
 */
export const validateSportIds = (
	sportIds: string[],
): {
	isValid: boolean;
	invalidIds: string[];
	validIds: string[];
} => {
	const validIds: string[] = [];
	const invalidIds: string[] = [];

	sportIds.forEach((sportId) => {
		if (isValidSportId(sportId)) {
			validIds.push(sportId);
		} else {
			invalidIds.push(sportId);
		}
	});

	return {
		isValid: invalidIds.length === 0,
		invalidIds,
		validIds,
	};
};

/**
 * Sanitize sport IDs by removing invalid ones and logging warnings
 * @param sportIds - Array of sport IDs to sanitize
 * @param context - Context for logging (e.g., "venue creation")
 * @returns Array of valid sport IDs only
 */
export const sanitizeSportIds = (sportIds: string[], context: string = "unknown"): string[] => {
	const { validIds, invalidIds } = validateSportIds(sportIds);

	if (invalidIds.length > 0) {
		console.warn(`[Sport Validator] Invalid sport IDs found in ${context}:`, invalidIds);
		console.warn(
			`[Sport Validator] Valid sport IDs available:`,
			SPORTS_CONFIG.map((s) => s.id),
		);
	}

	return validIds;
};

/**
 * Get all valid sport IDs
 * @returns Array of all valid sport IDs
 */
export const getAllValidSportIds = (): string[] => {
	return SPORTS_CONFIG.map((sport) => sport.id);
};

/**
 * Check if a sport ID needs migration (common mistakes)
 * @param sportId - Sport ID to check
 * @returns Suggested correct sport ID or null if no migration needed
 */
export const suggestSportIdMigration = (sportId: string): string | null => {
	const migrations: Record<string, string> = {
		"table-tennis": "table_tennis", // Fix hyphen vs underscore
		tabletennis: "table_tennis", // Fix missing separator
	};

	return migrations[sportId] || null;
};

/**
 * Auto-fix common sport ID mistakes
 * @param sportIds - Array of sport IDs that might need fixing
 * @returns Array of corrected sport IDs
 */
export const autoFixSportIds = (sportIds: string[]): string[] => {
	return sportIds.map((sportId) => {
		const suggestion = suggestSportIdMigration(sportId);
		if (suggestion) {
			console.info(`[Sport Validator] Auto-fixing sport ID: "${sportId}" → "${suggestion}"`);
			return suggestion;
		}
		return sportId;
	});
};
