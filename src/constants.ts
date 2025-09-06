/**
 * Constants for the timezone utility
 *
 * This module contains all shared constants to eliminate circular dependencies.
 * These constants were previously defined in index.ts but caused circular
 * dependency issues when imported by other modules.
 */

/**
 * Default timezone for convenience functions
 */
export const DEFAULT_TIMEZONE = "Europe/London";

/**
 * Default working hours
 */
export const DEFAULT_WORKING_HOURS = {
  start: "09:00",
  end: "17:30",
} as const;

/**
 * Default working days (Monday-Friday)
 */
export const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5] as const;
