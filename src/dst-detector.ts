/**
 * Platform-based DST detection using Intl APIs
 *
 * This module uses the platform's timezone database via Intl.DateTimeFormat
 * to detect DST status, ensuring always-current DST rules.
 */

import {
  getTimezoneMetadata,
  validatePlatformTimezone,
} from "./timezone-registry.js";
import { validateDate, validateTimezone } from "./validator.js";
import { DEFAULT_TIMEZONE } from "./index.js";

/**
 * Check if a date is in Daylight Saving Time for a given timezone
 *
 * Uses platform timezone databases via Intl.DateTimeFormat for accurate,
 * always-current DST detection. Supports all major timezones with automatic
 * fallback to offset-based detection when abbreviations are unavailable.
 *
 * @param date - The date to check (must be a valid Date object)
 * @param timezone - IANA timezone identifier (defaults to 'Europe/London')
 * @returns `true` if the date is in DST for the specified timezone
 *
 * @throws {Error} If date is invalid (NaN) or outside supported range (1970-2100)
 * @throws {Error} If timezone is not supported or unavailable on platform
 *
 * @example
 * ```typescript
 * const summerDate = new Date('2024-07-15T12:00:00Z');
 * const winterDate = new Date('2024-01-15T12:00:00Z');
 *
 * console.log(isDST(summerDate, 'Europe/London'));  // true (BST)
 * console.log(isDST(winterDate, 'Europe/London'));  // false (GMT)
 * console.log(isDST(summerDate, 'Asia/Tokyo'));     // false (no DST)
 * ```
 */
export function isDST(
  date: Date,
  timezone: string = DEFAULT_TIMEZONE
): boolean {
  validateDate(date);
  validateTimezone(timezone);

  const metadata = getTimezoneMetadata(timezone);
  validatePlatformTimezone(timezone);

  // If timezone doesn't have DST, it's never in DST
  if (!metadata.dstOffset) {
    return false;
  }

  // Use Intl.DateTimeFormat to get timezone information
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(date);
  const timeZoneName = parts.find(
    (part) => part.type === "timeZoneName"
  )?.value;

  if (!timeZoneName) {
    // Fallback: compare offset with expected DST offset
    return isDSTByOffset(date, timezone);
  }

  // Check if the timezone name indicates DST
  return isDSTAbbreviation(timeZoneName, timezone, date);
}

/**
 * Check if a date is in British Summer Time (convenience function for Europe/London)
 *
 * This is a convenience wrapper around isDST specifically for the Europe/London timezone.
 * Returns true when London time is in British Summer Time (BST, UTC+1), false when
 * in Greenwich Mean Time (GMT, UTC+0).
 *
 * @param date - The date to check (must be a valid Date object)
 * @returns `true` if the date is in BST (British Summer Time)
 *
 * @throws {Error} If date is invalid (NaN) or outside supported range (1970-2100)
 *
 * @example
 * ```typescript
 * const summerDate = new Date('2024-07-15T12:00:00Z');  // July
 * const winterDate = new Date('2024-01-15T12:00:00Z');  // January
 *
 * console.log(isBST(summerDate));  // true (BST period)
 * console.log(isBST(winterDate));  // false (GMT period)
 *
 * // Equivalent to:
 * console.log(isDST(summerDate, 'Europe/London'));  // true
 * console.log(isDST(winterDate, 'Europe/London'));  // false
 * ```
 */
export function isBST(date: Date): boolean {
  return isDST(date, "Europe/London");
}

/**
 * Determine if a timezone abbreviation indicates DST
 * @param abbreviation - The timezone abbreviation from Intl
 * @param timezone - The timezone identifier
 * @returns True if the abbreviation indicates DST
 */
function isDSTAbbreviation(
  abbreviation: string,
  timezone: string,
  date: Date
): boolean {
  const metadata = getTimezoneMetadata(timezone);

  // Check against known DST abbreviations
  if (
    metadata.preferredAbbreviations?.dst &&
    abbreviation === metadata.preferredAbbreviations.dst
  ) {
    return true;
  }

  // Check against known standard abbreviations
  if (
    metadata.preferredAbbreviations?.standard &&
    abbreviation === metadata.preferredAbbreviations.standard
  ) {
    return false;
  }

  // Handle GMT+offset format (common fallback from Intl)
  if (abbreviation.startsWith("GMT")) {
    const offsetMatch = abbreviation.match(/GMT([+-])(\d{1,2})/);
    if (offsetMatch) {
      const sign = offsetMatch[1] === "+" ? 1 : -1;
      const hours = parseInt(offsetMatch[2] ?? "0");
      const offsetMinutes = sign * hours * 60;

      // Compare with expected DST and standard offsets
      if (metadata.dstOffset && offsetMinutes === metadata.dstOffset) {
        return true;
      }
      if (offsetMinutes === metadata.standardOffset) {
        return false;
      }
    }
  }

  // Fallback to offset-based detection for unknown abbreviations
  return isDSTByOffset(date, timezone);
}

/**
 * Fallback DST detection by comparing current offset with expected offsets
 * @param date - The date to check
 * @param timezone - The timezone identifier
 * @returns True if the current offset matches the DST offset
 */
function isDSTByOffset(date: Date, timezone: string): boolean {
  const metadata = getTimezoneMetadata(timezone);

  // If no DST offset defined, never in DST
  if (!metadata.dstOffset) {
    return false;
  }

  // Get the current offset for this date/timezone
  const currentOffset = getTimezoneOffset(date, timezone);

  // Compare with expected DST offset
  return currentOffset === metadata.dstOffset;
}

/**
 * Get the timezone offset in minutes for a specific date and timezone
 * @param date - The date to check
 * @param timezone - The timezone identifier
 * @returns Offset in minutes from UTC (positive for east of UTC)
 */
function getTimezoneOffset(date: Date, timezone: string): number {
  // Create a date in the target timezone
  const utcTime = date.getTime();

  // Get the local time in the target timezone
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find((p) => p.type === "year")?.value ?? "0");
  const month =
    parseInt(parts.find((p) => p.type === "month")?.value ?? "0") - 1; // Month is 0-indexed
  const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "0");
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value ?? "0");
  const second = parseInt(parts.find((p) => p.type === "second")?.value ?? "0");

  // Create a local date object (this will be in the system timezone)
  const localTime = new Date(year, month, day, hour, minute, second).getTime();

  // Calculate the offset: (local time - UTC time) / (1000 * 60) = offset in minutes
  const offsetMinutes = (localTime - utcTime) / (1000 * 60);

  return Math.round(offsetMinutes);
}
