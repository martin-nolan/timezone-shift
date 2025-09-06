/**
 * Input validation utilities
 */

import type { TimeParts } from "../types.js";
import { getDaysInMonth } from "./date-utils.js";

/**
 * Validate a Date object
 * @param date - Date to validate
 * @throws Error if the date is invalid
 */
export function validateDate(date: Date): void {
  if (!(date instanceof Date)) {
    throw new Error("Invalid input: expected Date object");
  }

  if (isNaN(date.getTime())) {
    throw new Error("Invalid date: date is NaN");
  }

  // Check if date is within reasonable range (1970-2100)
  const year = date.getFullYear();
  if (year < 1970 || year > 2100) {
    throw new Error(
      `Date outside supported range: ${date.toISOString()}. Supported range: 1970-2100`
    );
  }
}

/**
 * Validate TimeParts object
 * @param parts - TimeParts to validate
 * @throws Error if the parts are invalid
 */
export function validateTimeParts(parts: TimeParts): void {
  if (!parts || typeof parts !== "object") {
    throw new Error("Invalid time parts: expected object");
  }

  const { year, month, day, hour, minute, second } = parts;

  // Validate types
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    !Number.isInteger(second)
  ) {
    throw new Error("Invalid time parts: all values must be integers");
  }

  // Validate ranges
  if (year < 1970 || year > 2100) {
    throw new Error(
      `Invalid time parts: year ${year} outside supported range (1970-2100)`
    );
  }

  if (month < 1 || month > 12) {
    throw new Error(
      `Invalid time parts: month ${month} must be between 1 and 12`
    );
  }

  const daysInMonth = getDaysInMonth(year, month);
  if (day < 1 || day > daysInMonth) {
    throw new Error(
      `Invalid time parts: day ${day} must be between 1 and ${daysInMonth} for ${year}-${month}`
    );
  }

  if (hour < 0 || hour > 23) {
    throw new Error(
      `Invalid time parts: hour ${hour} must be between 0 and 23`
    );
  }

  if (minute < 0 || minute > 59) {
    throw new Error(
      `Invalid time parts: minute ${minute} must be between 0 and 59`
    );
  }

  if (second < 0 || second > 59) {
    throw new Error(
      `Invalid time parts: second ${second} must be between 0 and 59`
    );
  }
}

/**
 * Validate timezone string
 * @param timezone - Timezone identifier to validate
 * @throws Error if the timezone is invalid
 */
export function validateTimezone(timezone: string): void {
  if (typeof timezone !== "string" || timezone.trim() === "") {
    throw new Error("Invalid timezone: expected non-empty string");
  }
}

/**
 * Validate that a timezone is supported by the platform
 * @param timezone - Timezone identifier to validate
 * @throws Error if the timezone is not available on the platform
 */
export function validatePlatformTimezone(timezone: string): void {
  try {
    // Test if Intl.DateTimeFormat supports this timezone
    new Intl.DateTimeFormat("en", { timeZone: timezone });
  } catch (error) {
    throw new Error(
      `Timezone '${timezone}' not available on this system. ` +
        `Please ensure your system has up-to-date timezone data. ` +
        `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
