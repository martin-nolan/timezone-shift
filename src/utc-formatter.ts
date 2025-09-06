/**
 * UTC string formatting utilities
 */

import { validateDate } from "./utils/validation.js";
import { pad } from "./utils/formatting.js";

/**
 * Format a Date as a stable UTC string in "YYYY-MM-DD HH:mm:ss.SSSSSZ" format
 *
 * Creates a consistently formatted UTC string with microsecond precision, suitable
 * for logging, storage, and chronological sorting. The format ensures stable
 * lexicographic ordering that matches chronological ordering.
 *
 * @param date - The date to format (must be a valid Date object)
 * @returns Formatted UTC string with microsecond precision
 *
 * @throws {Error} If date is invalid (NaN) or outside supported range (1970-2100)
 *
 * @example
 * ```typescript
 * const date1 = new Date('2024-07-15T14:35:42.123Z');
 * const date2 = new Date('2024-07-15T14:35:42.124Z');
 *
 * console.log(toUTCString(date1)); // "2024-07-15 14:35:42.123000Z"
 * console.log(toUTCString(date2)); // "2024-07-15 14:35:42.124000Z"
 *
 * // Strings sort correctly chronologically
 * const strings = [toUTCString(date2), toUTCString(date1)];
 * strings.sort();
 * console.log(strings); // ["2024-07-15 14:35:42.123000Z", "2024-07-15 14:35:42.124000Z"]
 *
 * // Handle zero-padding
 * const earlyDate = new Date('2024-01-05T08:05:05.007Z');
 * console.log(toUTCString(earlyDate)); // "2024-01-05 08:05:05.007000Z"
 * ```
 */
export function toUTCString(date: Date): string {
  validateDate(date);

  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1, 2); // getUTCMonth() is 0-indexed
  const day = pad(date.getUTCDate(), 2);
  const hours = pad(date.getUTCHours(), 2);
  const minutes = pad(date.getUTCMinutes(), 2);
  const seconds = pad(date.getUTCSeconds(), 2);
  const milliseconds = date.getUTCMilliseconds().toString().padStart(3, "0");

  // Pad milliseconds to 6 digits for microsecond precision
  const microseconds = milliseconds + "000";

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds}Z`;
}
