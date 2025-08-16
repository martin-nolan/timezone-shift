/**
 * Time formatting utilities for timezone-aware string output
 */

import {
  getTimezoneMetadata,
  validatePlatformTimezone,
} from "./timezone-registry.js";
import { validateDate, validateTimezone } from "./validator.js";
import { formatOffset } from "./utils.js";
import { isDST } from "./dst-detector.js";
import { DEFAULT_TIMEZONE } from "./index.js";

/**
 * Format a Date as a timezone-aware string in "YYYY-MM-DD HH:mm:ss TZ" format
 *
 * Formats a UTC date as local time in the specified timezone with proper timezone
 * abbreviation or offset. Uses preferred timezone abbreviations when available
 * (e.g., BST, EST, EDT) and falls back to GMT offset format for timezones without
 * standard abbreviations.
 *
 * @param date - The date to format (must be a valid Date object)
 * @param timezone - IANA timezone identifier (defaults to 'Europe/London')
 * @returns Formatted string in "YYYY-MM-DD HH:mm:ss TZ" format
 *
 * @throws {Error} If date is invalid (NaN) or outside supported range (1970-2100)
 * @throws {Error} If timezone is not supported or unavailable on platform
 *
 * @example
 * ```typescript
 * const utcDate = new Date('2024-07-15T12:00:00Z');
 *
 * console.log(toTimezoneString(utcDate, 'Europe/London'));       // "2024-07-15 13:00:00 BST"
 * console.log(toTimezoneString(utcDate, 'America/New_York'));    // "2024-07-15 08:00:00 EDT"
 * console.log(toTimezoneString(utcDate, 'Asia/Tokyo'));          // "2024-07-15 21:00:00 GMT+09:00"
 *
 * // Winter time (standard time)
 * const winterDate = new Date('2024-01-15T12:00:00Z');
 * console.log(toTimezoneString(winterDate, 'Europe/London'));    // "2024-01-15 12:00:00 GMT"
 * console.log(toTimezoneString(winterDate, 'America/New_York')); // "2024-01-15 07:00:00 EST"
 * ```
 */
export function toTimezoneString(
  date: Date,
  timezone: string = DEFAULT_TIMEZONE
): string {
  validateDate(date);
  validateTimezone(timezone);

  validatePlatformTimezone(timezone);

  // Get timezone-local time components
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
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "00";
  const day = parts.find((p) => p.type === "day")?.value ?? "00";
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  const second = parts.find((p) => p.type === "second")?.value ?? "00";

  // Determine timezone abbreviation
  const tzAbbreviation = getTimezoneAbbreviation(date, timezone);

  return `${year}-${month}-${day} ${hour}:${minute}:${second} ${tzAbbreviation}`;
}

/**
 * Format a Date as London local time string (convenience function)
 * @param date - The date to format
 * @returns Formatted string in "YYYY-MM-DD HH:mm:ss BST|GMT" format
 * @throws Error if date is invalid
 */
export function toLondonString(date: Date): string {
  return toTimezoneString(date, "Europe/London");
}

/**
 * Get the appropriate timezone abbreviation for a date and timezone
 * @param date - The date to check
 * @param timezone - The timezone identifier
 * @returns Timezone abbreviation (preferred) or offset format (fallback)
 */
function getTimezoneAbbreviation(date: Date, timezone: string): string {
  const metadata = getTimezoneMetadata(timezone);

  // For timezones without DST, use standard abbreviation or offset
  if (!metadata.dstOffset) {
    return (
      metadata.preferredAbbreviations?.standard ??
      formatOffset(metadata.standardOffset)
    );
  }

  // Check if currently in DST
  const inDST = isDST(date, timezone);

  if (inDST) {
    return (
      metadata.preferredAbbreviations?.dst ?? formatOffset(metadata.dstOffset)
    );
  } else {
    return (
      metadata.preferredAbbreviations?.standard ??
      formatOffset(metadata.standardOffset)
    );
  }
}
