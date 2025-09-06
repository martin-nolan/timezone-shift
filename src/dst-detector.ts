/**
 * Platform-based DST detection using Intl APIs
 *
 * This module uses the platform's timezone database via Intl.DateTimeFormat
 * to detect DST status, ensuring always-current DST rules.
 */

import { getTimezoneMetadata } from "./timezone-registry.js";
import {
  validateDate,
  validateTimezone,
  validatePlatformTimezone,
} from "./utils/validation.js";
import { getTimezoneOffset } from "./utils/date-utils.js";
import { timezoneDetector } from "./timezone-detector.js";

/**
 * Check if a date is in Daylight Saving Time for a given timezone
 *
 * Uses platform timezone databases via Intl.DateTimeFormat for accurate,
 * always-current DST detection. Supports all major timezones with automatic
 * fallback to offset-based detection when abbreviations are unavailable.
 *
 * When no timezone is provided, automatically detects the user's timezone.
 *
 * @param date - The date to check (must be a valid Date object)
 * @param timezone - IANA timezone identifier (optional, auto-detects if omitted)
 * @returns `true` if the date is in DST for the specified or detected timezone
 *
 * @throws {Error} If date is invalid (NaN) or outside supported range (1970-2100)
 * @throws {Error} If timezone is not supported or unavailable on platform
 * @throws {TimezoneDetectionError} If timezone detection fails and fallback is invalid
 *
 * @example
 * ```typescript
 * const summerDate = new Date('2024-07-15T12:00:00Z');
 * const winterDate = new Date('2024-01-15T12:00:00Z');
 *
 * // With explicit timezone
 * console.log(isDST(summerDate, 'Europe/London'));  // true (BST)
 * console.log(isDST(winterDate, 'Europe/London'));  // false (GMT)
 * console.log(isDST(summerDate, 'Asia/Tokyo'));     // false (no DST)
 *
 * // With auto-detection (uses user's timezone)
 * console.log(isDST(summerDate));  // true/false based on user's timezone
 * console.log(isDST(winterDate));  // true/false based on user's timezone
 * ```
 */
export function isDST(date: Date, timezone?: string): boolean {
  validateDate(date);

  // Use auto-detection if no timezone provided
  const effectiveTimezone = timezone ?? timezoneDetector.getDetectedTimezone();
  validateTimezone(effectiveTimezone);

  const metadata = getTimezoneMetadata(effectiveTimezone);
  validatePlatformTimezone(effectiveTimezone);

  // If timezone doesn't have DST, it's never in DST
  if (!metadata.dstOffset) {
    return false;
  }

  // Use Intl.DateTimeFormat to get timezone information
  const formatter = new Intl.DateTimeFormat("en", {
    timeZone: effectiveTimezone,
    timeZoneName: "short",
  });

  const parts = formatter.formatToParts(date);
  const timeZoneName = parts.find(
    (part) => part.type === "timeZoneName"
  )?.value;

  if (!timeZoneName) {
    // Fallback: compare offset with expected DST offset
    return isDSTByOffset(date, effectiveTimezone);
  }

  // Check if the timezone name indicates DST
  return isDSTAbbreviation(timeZoneName, effectiveTimezone, date);
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
