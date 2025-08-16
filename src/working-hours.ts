/**
 * Working hours and business day utilities
 */

import type { WorkingDays } from "./types.js";
import { validatePlatformTimezone } from "./timezone-registry.js";
import {
  validateDate,
  validateTimezone,
  validateTimeString,
  validateWorkingDays,
} from "./validator.js";
import { toTimezoneParts } from "./time-converter.js";
import {
  DEFAULT_TIMEZONE,
  DEFAULT_WORKING_HOURS,
  DEFAULT_WORKING_DAYS,
} from "./index.js";

/**
 * Check if a timestamp falls within working hours for a given timezone
 *
 * Converts the input timestamp to the specified timezone's local time and checks
 * if it falls within the defined working hours range. Handles timezone-aware
 * calculations correctly, including DST transitions.
 *
 * @param date - The date to check (must be a valid Date object)
 * @param timezone - IANA timezone identifier (defaults to 'Europe/London')
 * @param start - Start time in HH:MM format (defaults to '09:00')
 * @param end - End time in HH:MM format (defaults to '17:30')
 * @returns `true` if the timestamp is within working hours in the specified timezone
 *
 * @throws {Error} If date is invalid (NaN) or outside supported range (1970-2100)
 * @throws {Error} If timezone is not supported or unavailable on platform
 * @throws {Error} If time format is invalid (must be HH:MM format, e.g., '09:00')
 *
 * @example
 * ```typescript
 * const utcTime = new Date('2024-07-15T13:00:00Z');  // 1 PM UTC
 *
 * // Default working hours (09:00-17:30)
 * console.log(inWorkingHours(utcTime, 'Europe/London'));     // true (14:00 BST)
 * console.log(inWorkingHours(utcTime, 'America/New_York'));  // false (09:00 EDT, at start)
 * console.log(inWorkingHours(utcTime, 'Asia/Tokyo'));        // false (22:00 JST, after hours)
 *
 * // Custom working hours
 * console.log(inWorkingHours(utcTime, 'Europe/London', '08:00', '16:00')); // true
 *
 * // Midnight-spanning hours (22:00-06:00)
 * const nightTime = new Date('2024-07-15T23:00:00Z');  // 11 PM UTC
 * console.log(inWorkingHours(nightTime, 'Europe/London', '22:00', '06:00')); // true (00:00 BST)
 * ```
 */
export function inWorkingHours(
  date: Date,
  timezone: string = DEFAULT_TIMEZONE,
  start: string = DEFAULT_WORKING_HOURS.start,
  end: string = DEFAULT_WORKING_HOURS.end
): boolean {
  validateDate(date);
  validateTimezone(timezone);
  validateTimeString(start);
  validateTimeString(end);

  validatePlatformTimezone(timezone);

  // Get timezone-local time components
  const localParts = toTimezoneParts(date, timezone);

  // Parse start and end times
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  // Convert current time to minutes since midnight
  const currentMinutes = localParts.hour * 60 + localParts.minute;
  const startMinutes = startHour! * 60 + startMinute!;
  const endMinutes = endHour! * 60 + endMinute!;

  // Check if current time is within working hours
  if (startMinutes <= endMinutes) {
    // Normal case: start and end are on the same day
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  } else {
    // Edge case: working hours span midnight (e.g., 22:00 to 06:00)
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  }
}

/**
 * Check if a timestamp falls within London working hours (convenience function)
 * @param date - The date to check
 * @param start - Start time in HH:MM format (defaults to '09:00')
 * @param end - End time in HH:MM format (defaults to '17:30')
 * @returns True if the timestamp is within London working hours
 * @throws Error if inputs are invalid
 */
export function inWorkingHoursLondon(
  date: Date,
  start: string = DEFAULT_WORKING_HOURS.start,
  end: string = DEFAULT_WORKING_HOURS.end
): boolean {
  return inWorkingHours(date, "Europe/London", start, end);
}

/**
 * Check if a date falls on a working day
 * @param date - The date to check
 * @param timezone - The timezone identifier (defaults to Europe/London)
 * @param workingDays - Array of working days (0=Sunday, 1=Monday, etc.) (defaults to Monday-Friday)
 * @returns True if the date is a working day
 * @throws Error if inputs are invalid
 */
export function isWorkingDay(
  date: Date,
  timezone: string = DEFAULT_TIMEZONE,
  workingDays: WorkingDays = [...DEFAULT_WORKING_DAYS]
): boolean {
  validateDate(date);
  validateTimezone(timezone);
  validateWorkingDays(workingDays);

  validatePlatformTimezone(timezone);

  // Get timezone-local date to determine the correct day of week
  const localParts = toTimezoneParts(date, timezone);

  // Create a date in the local timezone to get the correct day of week
  // Note: We use the local parts to construct a date that represents the local date
  const localDate = new Date(
    localParts.year,
    localParts.month - 1,
    localParts.day
  );
  const dayOfWeek = localDate.getDay(); // 0=Sunday, 1=Monday, etc.

  return workingDays.includes(dayOfWeek);
}
