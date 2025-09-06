/**
 * Tests for validation utilities
 */

import { describe, it, expect } from "vitest";
import {
  validateDate,
  validateTimeParts,
  validateTimezone,
  validateTimeString,
  validateYear,
  validateWorkingDays,
} from "../../validator.js";

describe("Validator", () => {
  describe("validateDate", () => {
    it("should accept valid dates", () => {
      expect(() =>
        validateDate(new Date("2024-07-15T12:00:00Z"))
      ).not.toThrow();
      expect(() => validateDate(new Date(2024, 6, 15))).not.toThrow();
    });

    it("should reject invalid dates", () => {
      expect(() => validateDate(new Date("invalid"))).toThrow(
        "Invalid date: date is NaN"
      );
      expect(() => validateDate({} as Date)).toThrow(
        "Invalid input: expected Date object"
      );
    });

    it("should reject dates outside supported range", () => {
      expect(() => validateDate(new Date("1969-01-01T00:00:00Z"))).toThrow(
        "Date outside supported range"
      );
      expect(() => validateDate(new Date("2101-01-01T00:00:00Z"))).toThrow(
        "Date outside supported range"
      );
    });
  });

  describe("validateTimeParts", () => {
    it("should accept valid time parts", () => {
      expect(() =>
        validateTimeParts({
          year: 2024,
          month: 7,
          day: 15,
          hour: 12,
          minute: 30,
          second: 45,
        })
      ).not.toThrow();
    });

    it("should reject invalid time parts object", () => {
      expect(() => validateTimeParts(null as any)).toThrow(
        "Invalid time parts: expected object"
      );
      expect(() => validateTimeParts("invalid" as any)).toThrow(
        "Invalid time parts: expected object"
      );
    });

    it("should reject non-integer values", () => {
      expect(() =>
        validateTimeParts({
          year: 2024.5,
          month: 7,
          day: 15,
          hour: 12,
          minute: 30,
          second: 45,
        })
      ).toThrow("Invalid time parts: all values must be integers");
    });

    it("should reject out-of-range values", () => {
      // Invalid month
      expect(() =>
        validateTimeParts({
          year: 2024,
          month: 13,
          day: 15,
          hour: 12,
          minute: 30,
          second: 45,
        })
      ).toThrow("Invalid time parts: month 13 must be between 1 and 12");

      // Invalid day
      expect(() =>
        validateTimeParts({
          year: 2024,
          month: 2,
          day: 30,
          hour: 12,
          minute: 30,
          second: 45,
        })
      ).toThrow(
        "Invalid time parts: day 30 must be between 1 and 29 for 2024-2"
      );

      // Invalid hour
      expect(() =>
        validateTimeParts({
          year: 2024,
          month: 7,
          day: 15,
          hour: 24,
          minute: 30,
          second: 45,
        })
      ).toThrow("Invalid time parts: hour 24 must be between 0 and 23");
    });
  });

  describe("validateTimezone", () => {
    it("should accept valid timezone strings", () => {
      expect(() => validateTimezone("Europe/London")).not.toThrow();
      expect(() => validateTimezone("America/New_York")).not.toThrow();
    });

    it("should reject invalid timezone values", () => {
      expect(() => validateTimezone("")).toThrow(
        "Invalid timezone: expected non-empty string"
      );
      expect(() => validateTimezone("   ")).toThrow(
        "Invalid timezone: expected non-empty string"
      );
      expect(() => validateTimezone(123 as any)).toThrow(
        "Invalid timezone: expected non-empty string"
      );
    });
  });

  describe("validateTimeString", () => {
    it("should accept valid time strings", () => {
      expect(() => validateTimeString("09:00")).not.toThrow();
      expect(() => validateTimeString("17:30")).not.toThrow();
      expect(() => validateTimeString("00:00")).not.toThrow();
      expect(() => validateTimeString("23:59")).not.toThrow();
    });

    it("should reject invalid time strings", () => {
      expect(() => validateTimeString("25:00")).toThrow("Invalid time format");
      expect(() => validateTimeString("12:60")).toThrow("Invalid time format");
      expect(() => validateTimeString("9:00")).toThrow("Invalid time format"); // Missing leading zero
      expect(() => validateTimeString("12:5")).toThrow("Invalid time format"); // Missing leading zero
      expect(() => validateTimeString("invalid")).toThrow(
        "Invalid time format"
      );
    });
  });

  describe("validateYear", () => {
    it("should accept valid years", () => {
      expect(() => validateYear(2024)).not.toThrow();
      expect(() => validateYear(1970)).not.toThrow();
      expect(() => validateYear(2100)).not.toThrow();
    });

    it("should reject invalid years", () => {
      expect(() => validateYear(2024.5)).toThrow(
        "Invalid year: expected integer"
      );
      expect(() => validateYear(1969)).toThrow(
        "Invalid year: 1969 outside supported range"
      );
      expect(() => validateYear(2101)).toThrow(
        "Invalid year: 2101 outside supported range"
      );
    });
  });

  describe("validateWorkingDays", () => {
    it("should accept valid working days arrays", () => {
      expect(() => validateWorkingDays([1, 2, 3, 4, 5])).not.toThrow(); // Mon-Fri
      expect(() => validateWorkingDays([0, 1, 2, 3, 4, 5, 6])).not.toThrow(); // All days
      expect(() => validateWorkingDays([])).not.toThrow(); // No working days
    });

    it("should reject invalid working days", () => {
      expect(() => validateWorkingDays("invalid" as any)).toThrow(
        "Invalid working days: expected array"
      );
      expect(() => validateWorkingDays([7])).toThrow("Invalid working day: 7");
      expect(() => validateWorkingDays([-1])).toThrow(
        "Invalid working day: -1"
      );
      expect(() => validateWorkingDays([1, 1, 2])).toThrow(
        "Invalid working days: contains duplicates"
      );
    });
  });
});
