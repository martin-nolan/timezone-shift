/**
 * Time conversion utilities for timezone-aware operations
 */

import type { TimeParts } from "./types.js";
import {
  getTimezoneMetadata,
  validatePlatformTimezone,
} from "./timezone-registry.js";
import {
  validateDate,
  validateTimezone,
  validateTimeParts,
} from "./validator.js";
import { DEFAULT_TIMEZONE } from "./index.js";

/**
 * Extract timezone-local time components from a UTC Date
 *
 * Converts a UTC Date object into timezone-local time components, accounting for
 * DST transitions and timezone offsets. The returned TimeParts represent the local
 * time as it would appear on a clock in the specified timezone.
 *
 * @param date - The UTC date to convert (must be a valid Date object)
 * @param timezone - IANA timezone identifier (defaults to 'Europe/London')
 * @returns TimeParts object with local time components
 *
 * @throws {Error} If date is invalid (NaN) or outside supported range (1970-2100)
 * @throws {Error} If timezone is not supported or unavailable on platform
 *
 * @example
 * ```typescript
 * const utcDate = new Date('2024-07-15T12:00:00Z');  // UTC noon
 *
 * const londonParts = toTimezoneParts(utcDate, 'Europe/London');
 * console.log(londonParts);  // { year: 2024, month: 7, day: 15, hour: 13, minute: 0, second: 0 } (BST)
 *
 * const newYorkParts = toTimezoneParts(utcDate, 'America/New_York');
 * console.log(newYorkParts); // { year: 2024, month: 7, day: 15, hour: 8, minute: 0, second: 0 } (EDT)
 *
 * const tokyoParts = toTimezoneParts(utcDate, 'Asia/Tokyo');
 * console.log(tokyoParts);   // { year: 2024, month: 7, day: 15, hour: 21, minute: 0, second: 0 } (JST)
 * ```
 */
export function toTimezoneParts(
  date: Date,
  timezone: string = DEFAULT_TIMEZONE
): TimeParts {
  validateDate(date);
  validateTimezone(timezone);

  validatePlatformTimezone(timezone);

  // Use Intl.DateTimeFormat to get timezone-local components
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

  return {
    year: parseInt(parts.find((p) => p.type === "year")?.value ?? "0"),
    month: parseInt(parts.find((p) => p.type === "month")?.value ?? "0"),
    day: parseInt(parts.find((p) => p.type === "day")?.value ?? "0"),
    hour: parseInt(parts.find((p) => p.type === "hour")?.value ?? "0"),
    minute: parseInt(parts.find((p) => p.type === "minute")?.value ?? "0"),
    second: parseInt(parts.find((p) => p.type === "second")?.value ?? "0"),
  };
}

/**
 * Extract London local time components from a UTC Date (convenience function)
 *
 * Convenience wrapper around toTimezoneParts specifically for Europe/London timezone.
 * Automatically handles GMT/BST transitions.
 *
 * @param date - The UTC date to convert (must be a valid Date object)
 * @returns TimeParts object with London local time components
 *
 * @throws {Error} If date is invalid (NaN) or outside supported range (1970-2100)
 *
 * @example
 * ```typescript
 * const utcDate = new Date('2024-07-15T12:00:00Z');  // UTC noon in summer
 * const londonParts = toLondonParts(utcDate);
 * console.log(londonParts);  // { year: 2024, month: 7, day: 15, hour: 13, minute: 0, second: 0 } (BST)
 *
 * const winterDate = new Date('2024-01-15T12:00:00Z');  // UTC noon in winter
 * const winterParts = toLondonParts(winterDate);
 * console.log(winterParts);  // { year: 2024, month: 1, day: 15, hour: 12, minute: 0, second: 0 } (GMT)
 * ```
 */
export function toLondonParts(date: Date): TimeParts {
  return toTimezoneParts(date, "Europe/London");
}

/**
 * Create a UTC Date from timezone-local time components
 *
 * Converts timezone-local time parts into a UTC Date object, properly handling
 * DST edge cases. Uses a ±180 minute search window with 1-minute resolution to
 * resolve ambiguous times.
 *
 * **DST Edge Case Handling:**
 * - **Spring forward gaps**: Non-existent times are advanced to the first valid time
 * - **Autumn fallback duplicates**: Ambiguous times resolve to first occurrence (DST time)
 *
 * @param parts - The local time components in the specified timezone
 * @param timezone - IANA timezone identifier (defaults to 'Europe/London')
 * @returns UTC Date object
 *
 * @throws {Error} If time parts are invalid (e.g., month 13, hour 25)
 * @throws {Error} If timezone is not supported or unavailable on platform
 * @throws {Error} If time cannot be resolved after exhaustive search
 *
 * @example
 * ```typescript
 * // Normal case
 * const normalParts = { year: 2024, month: 7, day: 15, hour: 14, minute: 30, second: 0 };
 * const utcDate = fromTimezoneParts(normalParts, 'Europe/London');
 * console.log(utcDate.toISOString()); // "2024-07-15T13:30:00.000Z" (BST-1)
 *
 * // Spring forward gap (01:30 doesn't exist in London on March 31, 2024)
 * const gapParts = { year: 2024, month: 3, day: 31, hour: 1, minute: 30, second: 0 };
 * const resolvedGap = fromTimezoneParts(gapParts, 'Europe/London');
 * const resolvedLocal = toTimezoneParts(resolvedGap, 'Europe/London');
 * console.log(resolvedLocal.hour); // 2 (or later) - advanced to valid time
 *
 * // Autumn fallback duplicate (01:30 occurs twice on October 27, 2024)
 * const duplicateParts = { year: 2024, month: 10, day: 27, hour: 1, minute: 30, second: 0 };
 * const resolvedDup = fromTimezoneParts(duplicateParts, 'Europe/London');
 * console.log(isDST(resolvedDup, 'Europe/London')); // true (first occurrence, BST)
 * ```
 */
export function fromTimezoneParts(
  parts: TimeParts,
  timezone: string = DEFAULT_TIMEZONE
): Date {
  validateTimeParts(parts);
  validateTimezone(timezone);

  const metadata = getTimezoneMetadata(timezone);
  validatePlatformTimezone(timezone);

  // Build initial guess using UTC constructor, then adjust for timezone offset
  // Start with a UTC date and adjust by the expected timezone offset
  const utcGuess = new Date(
    Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second
    )
  );

  // Adjust by the standard timezone offset to get closer to the correct UTC time
  const offsetAdjustment = metadata.standardOffset * 60000; // Convert minutes to milliseconds
  const guess = new Date(utcGuess.getTime() - offsetAdjustment);

  // Search within ±180 minutes, 1-minute steps for matching timezone parts
  for (let offset = 0; offset <= 180; offset++) {
    const candidates =
      offset === 0
        ? [guess]
        : [
            new Date(guess.getTime() + offset * 60000),
            new Date(guess.getTime() - offset * 60000),
          ];

    for (const candidate of candidates) {
      if (matchesTimezoneParts(candidate, parts, timezone)) {
        return candidate; // First match wins
      }
    }
  }

  // If no exact match found, try to find the closest valid time after the requested time
  // This handles spring forward gaps by advancing to the first valid time
  for (let offset = 0; offset <= 180; offset += 60) {
    // Check every hour
    const candidate = new Date(guess.getTime() + offset * 60000);
    try {
      const candidateParts = toTimezoneParts(candidate, timezone);
      // If we can get parts and the date/time is reasonable, use it
      if (
        candidateParts.year === parts.year &&
        candidateParts.month === parts.month &&
        candidateParts.day === parts.day
      ) {
        return candidate;
      }
    } catch {
      // Continue searching
    }
  }

  throw new Error(
    `Cannot resolve time parts for ${timezone}: ${JSON.stringify(parts)}. ` +
      `This may be a non-existent time during DST transition.`
  );
}

/**
 * Create a UTC Date from London local time components (convenience function)
 * @param parts - The London local time components
 * @returns UTC Date object
 * @throws Error if parts are invalid or cannot be resolved
 */
export function fromLondonParts(parts: TimeParts): Date {
  return fromTimezoneParts(parts, "Europe/London");
}

/**
 * Check if a UTC date produces the expected timezone-local parts
 * @param utcDate - The UTC date to test
 * @param expectedParts - The expected local time parts
 * @param timezone - The timezone identifier
 * @returns True if the UTC date produces the expected local parts
 */
function matchesTimezoneParts(
  utcDate: Date,
  expectedParts: TimeParts,
  timezone: string
): boolean {
  try {
    const actualParts = toTimezoneParts(utcDate, timezone);

    return (
      actualParts.year === expectedParts.year &&
      actualParts.month === expectedParts.month &&
      actualParts.day === expectedParts.day &&
      actualParts.hour === expectedParts.hour &&
      actualParts.minute === expectedParts.minute &&
      actualParts.second === expectedParts.second
    );
  } catch {
    return false;
  }
}
