/**
 * Input validation utilities
 */

import type { TimeParts } from "./types.js";
import { getDaysInMonth } from "./utils.js";

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
 * Validate working hours time string (HH:MM format)
 * @param time - Time string to validate
 * @throws Error if the time format is invalid
 */
export function validateTimeString(time: string): void {
  if (typeof time !== "string") {
    throw new Error("Invalid time: expected string");
  }

  const timeRegex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
  if (!timeRegex.test(time)) {
    throw new Error(
      `Invalid time format: ${time}. Expected HH:MM format (e.g., '09:00', '17:30')`
    );
  }
}

/**
 * Validate year
 * @param year - Year to validate
 * @throws Error if the year is invalid
 */
export function validateYear(year: number): void {
  if (!Number.isInteger(year)) {
    throw new Error("Invalid year: expected integer");
  }

  if (year < 1970 || year > 2100) {
    throw new Error(
      `Invalid year: ${year} outside supported range (1970-2100)`
    );
  }
}

/**
 * Validate working days array
 * @param workingDays - Array of working days (0=Sunday, 1=Monday, etc.)
 * @throws Error if the working days are invalid
 */
export function validateWorkingDays(workingDays: number[]): void {
  if (!Array.isArray(workingDays)) {
    throw new Error("Invalid working days: expected array");
  }

  for (const day of workingDays) {
    if (!Number.isInteger(day) || day < 0 || day > 6) {
      throw new Error(
        `Invalid working day: ${day}. Expected integers 0-6 (0=Sunday, 1=Monday, etc.)`
      );
    }
  }

  // Check for duplicates
  const uniqueDays = new Set(workingDays);
  if (uniqueDays.size !== workingDays.length) {
    throw new Error("Invalid working days: contains duplicates");
  }
}
