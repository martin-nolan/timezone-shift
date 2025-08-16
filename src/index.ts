/**
 * Timezone Shift - Lightweight timezone utility with multi-timezone DST support
 *
 * This library provides timezone-aware date/time operations using platform timezone databases
 * for accurate DST handling across multiple common timezones.
 */

// Export all types
export type {
  TimeParts,
  TimezoneMetadata,
  DstTransitions,
  NextTransition,
  ClockChanges,
  NextChange,
  SupportedTimezone,
  WorkingDays,
} from "./types.js";

// Export timezone registry utilities
export {
  getTimezoneMetadata,
  isSupportedTimezone,
  validatePlatformTimezone,
  getSupportedTimezones,
} from "./timezone-registry.js";

// DST Detection functions
export { isDST, isBST } from "./dst-detector.js";

// Time formatting functions
export { toTimezoneString, toLondonString } from "./formatter.js";

// Time conversion functions
export {
  toTimezoneParts,
  toLondonParts,
  fromTimezoneParts,
  fromLondonParts,
} from "./time-converter.js";

// UTC formatting functions
export { toUTCString } from "./utc-formatter.js";

// Working hours and business day functions
export {
  inWorkingHours,
  inWorkingHoursLondon,
  isWorkingDay,
} from "./working-hours.js";

// DST transition utilities
export {
  dstTransitionDates,
  clockChangeDates,
  nextDstTransition,
  nextClockChange,
} from "./dst-transitions.js";

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
