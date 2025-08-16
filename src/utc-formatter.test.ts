/**
 * Tests for UTC formatting functionality
 */

import { describe, it, expect } from "vitest";
import { toUTCString } from "./utc-formatter.js";

describe("UTC Formatter", () => {
  describe("toUTCString", () => {
    it("should format UTC date with millisecond precision", () => {
      const date = new Date("2024-07-15T14:35:42.123Z");
      const result = toUTCString(date);
      expect(result).toBe("2024-07-15 14:35:42.123000Z");
    });

    it("should zero-pad all components correctly", () => {
      const date = new Date("2024-01-05T08:05:05.007Z");
      const result = toUTCString(date);
      expect(result).toBe("2024-01-05 08:05:05.007000Z");
    });

    it("should handle midnight correctly", () => {
      const date = new Date("2024-07-15T00:00:00.000Z");
      const result = toUTCString(date);
      expect(result).toBe("2024-07-15 00:00:00.000000Z");
    });

    it("should handle end of day correctly", () => {
      const date = new Date("2024-07-15T23:59:59.999Z");
      const result = toUTCString(date);
      expect(result).toBe("2024-07-15 23:59:59.999000Z");
    });

    it("should handle year boundaries correctly", () => {
      const newYear = new Date("2024-01-01T00:00:00.000Z");
      const endYear = new Date("2024-12-31T23:59:59.999Z");

      expect(toUTCString(newYear)).toBe("2024-01-01 00:00:00.000000Z");
      expect(toUTCString(endYear)).toBe("2024-12-31 23:59:59.999000Z");
    });

    it("should handle leap year correctly", () => {
      const leapDay = new Date("2024-02-29T12:00:00.000Z");
      const result = toUTCString(leapDay);
      expect(result).toBe("2024-02-29 12:00:00.000000Z");
    });

    it("should produce chronologically sortable strings", () => {
      const dates = [
        new Date("2024-07-15T14:35:42.123Z"),
        new Date("2024-07-15T14:35:42.124Z"),
        new Date("2024-07-15T14:35:43.000Z"),
        new Date("2024-07-15T14:36:00.000Z"),
        new Date("2024-07-16T00:00:00.000Z"),
      ];

      const formatted = dates.map(toUTCString);
      const sorted = [...formatted].sort();

      expect(formatted).toEqual(sorted);
    });

    it("should be consistent for the same instant", () => {
      const date = new Date("2024-07-15T14:35:42.123Z");

      const result1 = toUTCString(date);
      const result2 = toUTCString(date);
      const result3 = toUTCString(new Date(date.getTime()));

      expect(result1).toBe(result2);
      expect(result1).toBe(result3);
      expect(result1).toBe("2024-07-15 14:35:42.123000Z");
    });

    it("should handle different millisecond values", () => {
      const tests = [
        { ms: 0, expected: "000000" },
        { ms: 1, expected: "001000" },
        { ms: 10, expected: "010000" },
        { ms: 100, expected: "100000" },
        { ms: 999, expected: "999000" },
      ];

      for (const test of tests) {
        const date = new Date(
          `2024-07-15T12:00:00.${test.ms.toString().padStart(3, "0")}Z`
        );
        const result = toUTCString(date);
        expect(result).toBe(`2024-07-15 12:00:00.${test.expected}Z`);
      }
    });

    it("should throw error for invalid dates", () => {
      expect(() => toUTCString(new Date("invalid"))).toThrow(
        "Invalid date: date is NaN"
      );
    });

    it("should throw error for dates outside supported range", () => {
      const tooEarly = new Date("1969-01-01T00:00:00Z");
      const tooLate = new Date("2101-01-01T00:00:00Z");

      expect(() => toUTCString(tooEarly)).toThrow(
        "Date outside supported range"
      );
      expect(() => toUTCString(tooLate)).toThrow(
        "Date outside supported range"
      );
    });

    it("should handle edge of supported range", () => {
      const earliest = new Date("1970-01-01T00:00:00.000Z");
      const latest = new Date("2100-12-31T23:59:59.999Z");

      expect(toUTCString(earliest)).toBe("1970-01-01 00:00:00.000000Z");
      expect(toUTCString(latest)).toBe("2100-12-31 23:59:59.999000Z");
    });

    describe("Format consistency across different input methods", () => {
      it("should format consistently regardless of how Date was created", () => {
        const timestamp = 1721054142123; // 2024-07-15T14:35:42.123Z

        const fromTimestamp = new Date(timestamp);
        const fromISOString = new Date("2024-07-15T14:35:42.123Z");
        const fromComponents = new Date(Date.UTC(2024, 6, 15, 14, 35, 42, 123)); // Month is 0-indexed

        const result1 = toUTCString(fromTimestamp);
        const result2 = toUTCString(fromISOString);
        const result3 = toUTCString(fromComponents);

        expect(result1).toBe("2024-07-15 14:35:42.123000Z");
        expect(result1).toBe(result2);
        expect(result1).toBe(result3);
      });
    });
  });
});
