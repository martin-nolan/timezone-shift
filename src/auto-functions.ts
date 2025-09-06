/**
 * Convenience functions with automatic timezone detection
 *
 * This module provides parameter-free convenience functions that automatically
 * detect the user's timezone and perform common operations without requiring
 * manual timezone specification.
 */

import { timezoneDetector } from "./timezone-detector.js";
import { isDST } from "./dst-detector.js";
import { toTimezoneParts } from "./time-converter.js";
import { inWorkingHours } from "./working-hours.js";
import { toTimezoneString } from "./formatter.js";
import { DEFAULT_WORKING_HOURS } from "./constants.js";

/**
 * Check if the current time is in Daylight Saving Time for the auto-detected timezone
 *
 * Uses automatic timezone detection to determine the user's timezone, then checks
 * if the current moment is in DST for that timezone. This provides a zero-parameter
 * way to check DST status without needing to specify a timezone.
 *
 * @returns `true` if the current time is in DST for the auto-detected timezone
 *
 * @throws {TimezoneDetectionError} If timezone detection fails and fallback is invalid
 *
 * @example
 * ```typescript
 * // Automatically detects user's timezone and checks current DST status
 * if (isDSTNow()) {
 *   console.log('Currently in daylight saving time');
 * } else {
 *   console.log('Currently in standard time');
 * }
 * ```
 */
export function isDSTNow(): boolean {
  const timezone = timezoneDetector.getDetectedTimezone();
  const now = new Date();
  return isDST(now, timezone);
}

/**
 * Get time components for the current time in the auto-detected timezone
 *
 * Uses automatic timezone detection to determine the user's timezone, then returns
 * the current time components (year, month, day, hour, minute, second) as they
 * would appear in that timezone's local time.
 *
 * @returns TimeParts object with current local time components
 *
 * @throws {TimezoneDetectionError} If timezone detection fails and fallback is invalid
 *
 * @example
 * ```typescript
 * const now = getCurrentTimezoneParts();
 * console.log(`Current local time: ${now.year}-${now.month}-${now.day} ${now.hour}:${now.minute}:${now.second}`);
 *
 * // Example output (if user is in London during BST):
 * // "Current local time: 2024-7-15 14:30:45"
 * ```
 */
export function getCurrentTimezoneParts() {
  const timezone = timezoneDetector.getDetectedTimezone();
  const now = new Date();
  return toTimezoneParts(now, timezone);
}

/**
 * Check if the current time is within working hours for the auto-detected timezone
 *
 * Uses automatic timezone detection to determine the user's timezone, then checks
 * if the current moment falls within the specified working hours in that timezone's
 * local time. Defaults to standard business hours (09:00-17:30).
 *
 * @param start - Start time in HH:MM format (defaults to '09:00')
 * @param end - End time in HH:MM format (defaults to '17:30')
 * @returns `true` if the current time is within working hours in the auto-detected timezone
 *
 * @throws {TimezoneDetectionError} If timezone detection fails and fallback is invalid
 * @throws {Error} If time format is invalid (must be HH:MM format, e.g., '09:00')
 *
 * @example
 * ```typescript
 * // Check with default working hours (09:00-17:30)
 * if (inWorkingHoursNow()) {
 *   console.log('Currently within business hours');
 * }
 *
 * // Check with custom working hours
 * if (inWorkingHoursNow('08:00', '18:00')) {
 *   console.log('Currently within extended business hours');
 * }
 *
 * // Check for night shift (22:00-06:00)
 * if (inWorkingHoursNow('22:00', '06:00')) {
 *   console.log('Currently within night shift hours');
 * }
 * ```
 */
export function inWorkingHoursNow(
  start: string = DEFAULT_WORKING_HOURS.start,
  end: string = DEFAULT_WORKING_HOURS.end
): boolean {
  const timezone = timezoneDetector.getDetectedTimezone();
  const now = new Date();
  return inWorkingHours(now, timezone, start, end);
}

/**
 * Format the current time in the auto-detected timezone
 *
 * Uses automatic timezone detection to determine the user's timezone, then formats
 * the current moment as a timezone-aware string in "YYYY-MM-DD HH:mm:ss TZ" format.
 * Uses proper timezone abbreviations when available.
 *
 * @returns Formatted string representing current time in auto-detected timezone
 *
 * @throws {TimezoneDetectionError} If timezone detection fails and fallback is invalid
 *
 * @example
 * ```typescript
 * console.log(formatNow());
 *
 * // Example outputs based on user's detected timezone:
 * // "2024-07-15 14:30:45 BST"     (London during summer)
 * // "2024-07-15 09:30:45 EDT"     (New York during summer)
 * // "2024-07-15 23:30:45 JST"     (Tokyo)
 * // "2024-01-15 12:30:45 GMT"     (London during winter)
 * ```
 */
export function formatNow(): string {
  const timezone = timezoneDetector.getDetectedTimezone();
  const now = new Date();
  return toTimezoneString(now, timezone);
}

/**
 * Get the currently detected or configured default timezone identifier
 *
 * Uses automatic timezone detection to determine the user's timezone, or returns
 * the manually configured default timezone if one has been set. This provides
 * access to the effective timezone being used by the auto-detection system.
 *
 * @returns IANA timezone identifier (e.g., 'America/New_York', 'Europe/London')
 *
 * @throws {TimezoneDetectionError} If timezone detection fails and fallback is invalid
 *
 * @example
 * ```typescript
 * const currentTimezone = getDetectedTimezone();
 * console.log(`Using timezone: ${currentTimezone}`);
 *
 * // Example outputs:
 * // "Using timezone: America/New_York"
 * // "Using timezone: Europe/London"
 * // "Using timezone: Asia/Tokyo"
 * ```
 */
export function getDetectedTimezone(): string {
  return timezoneDetector.getDetectedTimezone();
}

/**
 * Get detailed information about the currently detected timezone
 *
 * Uses automatic timezone detection to determine the user's timezone, then returns
 * comprehensive metadata including display name, current UTC offset, DST status,
 * timezone abbreviation, and the source of the timezone metadata.
 *
 * @returns TimezoneInfo object with detailed timezone information
 *
 * @throws {TimezoneDetectionError} If timezone detection fails and fallback is invalid
 *
 * @example
 * ```typescript
 * const info = getTimezoneInfo();
 * console.log(`Timezone: ${info.displayName} (${info.id})`);
 * console.log(`Current offset: ${info.currentOffset} minutes from UTC`);
 * console.log(`DST active: ${info.isDST}`);
 * console.log(`Abbreviation: ${info.abbreviation}`);
 * console.log(`Source: ${info.source}`);
 *
 * // Example output (London during summer):
 * // "Timezone: London (Europe/London)"
 * // "Current offset: 60 minutes from UTC"
 * // "DST active: true"
 * // "Abbreviation: BST"
 * // "Source: hardcoded"
 * ```
 */
export function getTimezoneInfo() {
  return timezoneDetector.getTimezoneInfo();
}

/**
 * Get the last timezone detection error, if any
 *
 * Returns the most recent error that occurred during timezone detection, or null
 * if the last detection was successful. This is useful for debugging timezone
 * detection issues or providing user feedback when detection fails.
 *
 * @returns TimezoneDetectionError object or null if no error occurred
 *
 * @example
 * ```typescript
 * const error = getTimezoneDetectionError();
 * if (error) {
 *   console.error(`Timezone detection failed: ${error.message}`);
 *   console.error(`Source: ${error.source}`);
 *   if (error.originalError) {
 *     console.error(`Original error: ${error.originalError.message}`);
 *   }
 * } else {
 *   console.log('Timezone detection was successful');
 * }
 * ```
 */
export function getTimezoneDetectionError() {
  return timezoneDetector.getTimezoneDetectionError();
}
