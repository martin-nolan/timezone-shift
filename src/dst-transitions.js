/**
 * DST transition date utilities
 */

import type {
  DstTransitions,
  NextTransition,
  ClockChanges,
  NextChange,
} from "./types.js";
import {
  getTimezoneMetadata,
  validatePlatformTimezone,
} from "./timezone-registry.js";
import { validateYear, validateTimezone, validateDate } from "./validator.js";
import { isDST } from "./dst-detector.js";
import { DEFAULT_TIMEZONE } from "./index.js";

/**
 * Get DST transition dates for a given year and timezone
 *
 * Finds the exact UTC timestamps when DST starts and ends for the specified
 * year and timezone. Returns null for timezones that don't observe DST
 * (like Asia/Tokyo).
 *
 * @param year - The year to get transitions for (1970-2100)
 * @param timezone - IANA timezone identifier (defaults to 'Europe/London')
 * @returns DST start and end dates in UTC, or null if timezone has no DST
 *
 * @throws {Error} If year is outside supported range (1970-2100)
 * @throws {Error} If timezone is not supported or unavailable on platform
 *
 * @example
 * ```typescript
 * // Get DST transitions for different timezones
 * const london2024 = dstTransitionDates(2024, 'Europe/London');
 * console.log(london2024?.dstStartUtc);  // 2024-03-31T01:00:00.000Z (BST starts)
 * console.log(london2024?.dstEndUtc);    // 2024-10-27T01:00:00.000Z (GMT resumes)
 *
 * const newYork2024 = dstTransitionDates(2024, 'America/New_York');
 * console.log(newYork2024?.dstStartUtc); // 2024-03-10T07:00:00.000Z (EDT starts)
 * console.log(newYork2024?.dstEndUtc);   // 2024-11-03T06:00:00.000Z (EST resumes)
 *
 * // No DST timezone
 * const tokyo2024 = dstTransitionDates(2024, 'Asia/Tokyo');
 * console.log(tokyo2024); // null (Japan doesn't observe DST)
 * ```
 */
export function dstTransitionDates(
  year: number,
  timezone: string = DEFAULT_TIMEZONE
): DstTransitions | null {
  validateYear(year);
  validateTimezone(timezone);

  const metadata = getTimezoneMetadata(timezone);
  validatePlatformTimezone(timezone);

  // If timezone doesn't have DST, return null
  if (!metadata.dstOffset) {
    return null;
  }

  // Find DST transitions by scanning through the year
  const transitions = findDSTTransitions(year, timezone);

  if (!transitions) {
    return null;
  }

  return {
    dstStartUtc: transitions.start,
    dstEndUtc: transitions.end,
  };
}

/**
 * Get clock change dates for Europe/London (convenience function)
 * @param year - The year to get clock changes for
 * @returns BST start and end dates
 * @throws Error if year is invalid
 */
export function clockChangeDates(year: number): ClockChanges {
  const transitions = dstTransitionDates(year, "Europe/London");

  if (!transitions) {
    throw new Error(`No DST transitions found for Europe/London in ${year}`);
  }

  return {
    bstStartUtc: transitions.dstStartUtc,
    bstEndUtc: transitions.dstEndUtc,
  };
}

/**
 * Find the next DST transition from a given date
 * @param from - The date to start searching from (defaults to current date)
 * @param timezone - The timezone identifier (defaults to Europe/London)
 * @returns Next DST transition information, or null if no transitions
 * @throws Error if inputs are invalid
 */
export function nextDstTransition(
  from?: Date,
  timezone: string = DEFAULT_TIMEZONE
): NextTransition | null {
  const fromDate = from ?? new Date();
  validateDate(fromDate);
  validateTimezone(timezone);

  const metadata = getTimezoneMetadata(timezone);
  validatePlatformTimezone(timezone);

  // If timezone doesn't have DST, return null
  if (!metadata.dstOffset) {
    return null;
  }

  const currentYear = fromDate.getFullYear();

  // Check current year and next year for transitions
  for (const year of [currentYear, currentYear + 1]) {
    const transitions = findDSTTransitions(year, timezone);

    if (!transitions) {
      continue;
    }

    // Check if DST start is in the future
    if (transitions.start > fromDate) {
      return {
        whenUtc: transitions.start,
        type: "start",
        year,
      };
    }

    // Check if DST end is in the future
    if (transitions.end > fromDate) {
      return {
        whenUtc: transitions.end,
        type: "end",
        year,
      };
    }
  }

  return null;
}

/**
 * Find the next clock change for Europe/London (convenience function)
 * @param from - The date to start searching from (defaults to current date)
 * @returns Next clock change information
 * @throws Error if inputs are invalid
 */
export function nextClockChange(from?: Date): NextChange | null {
  const transition = nextDstTransition(from, "Europe/London");

  if (!transition) {
    return null;
  }

  return {
    whenUtc: transition.whenUtc,
    type: transition.type,
    year: transition.year,
  };
}

/**
 * Find DST transitions for a given year and timezone using platform APIs
 * @param year - The year to search
 * @param timezone - The timezone identifier
 * @returns DST start and end dates, or null if no transitions found
 */
function findDSTTransitions(
  year: number,
  timezone: string
): { start: Date, end: Date } | null {
  const metadata = getTimezoneMetadata(timezone);

  if (!metadata.dstOffset) {
    return null;
  }

  let dstStart: Date | null = null;
  let dstEnd: Date | null = null;

  // Scan through the year day by day to find DST transitions
  // This is more thorough but still efficient for finding transitions
  let previousDST: boolean | null = null;

  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const testDate = new Date(Date.UTC(year, month, day, 12, 0, 0));
      const currentDST = isDST(testDate, timezone);

      if (previousDST !== null && previousDST !== currentDST) {
        // Found a transition
        const transitionDate = findExactTransitionDay(
          year,
          month,
          day,
          timezone,
          previousDST
        );

        if (transitionDate) {
          if (!previousDST && currentDST) {
            // Transition from standard to DST
            dstStart = transitionDate;
          } else if (previousDST && !currentDST) {
            // Transition from DST to standard
            dstEnd = transitionDate;
          }
        }
      }

      previousDST = currentDST;
    }
  }

  if (dstStart && dstEnd) {
    return { start: dstStart, end: dstEnd };
  }

  return null;
}

/**
 * Find the exact DST transition time on a specific day
 * @param year - The year
 * @param month - The month (0-11, JavaScript Date format)
 * @param day - The day when transition occurs
 * @param timezone - The timezone identifier
 * @param previousDST - Whether the previous day was in DST
 * @returns The exact transition date, or null if not found
 */
function findExactTransitionDay(
  year: number,
  month: number,
  day: number,
  timezone: string,
  previousDST: boolean
): Date | null {
  // Check each hour of the transition day
  for (let hour = 0; hour < 24; hour++) {
    const testDate = new Date(Date.UTC(year, month, day, hour, 0, 0));
    const testDST = isDST(testDate, timezone);

    if (testDST !== previousDST) {
      // Found the transition hour, return the exact time
      return new Date(Date.UTC(year, month, day, hour, 0, 0));
    }
  }

  return null;
}
