/**
 * Tests for time formatting functionality
 */

import { describe, it, expect } from "vitest";
import { toTimezoneString, toLondonString } from "../../formatter.js";

describe("Formatter", () => {
  describe("toTimezoneString", () => {
    describe("Europe/London", () => {
      it("should format BST time correctly", () => {
        const summerDate = new Date("2024-07-15T12:00:00Z"); // UTC noon in July
        const result = toTimezoneString(summerDate, "Europe/London");
        expect(result).toBe("2024-07-15 13:00:00 BST");
      });

      it("should format GMT time correctly", () => {
        const winterDate = new Date("2024-01-15T12:00:00Z"); // UTC noon in January
        const result = toTimezoneString(winterDate, "Europe/London");
        expect(result).toBe("2024-01-15 12:00:00 GMT");
      });
    });

    describe("America/New_York", () => {
      it("should format EDT time correctly", () => {
        const summerDate = new Date("2024-07-15T16:00:00Z"); // UTC 4pm in July
        const result = toTimezoneString(summerDate, "America/New_York");
        expect(result).toBe("2024-07-15 12:00:00 EDT");
      });

      it("should format EST time correctly", () => {
        const winterDate = new Date("2024-01-15T17:00:00Z"); // UTC 5pm in January
        const result = toTimezoneString(winterDate, "America/New_York");
        expect(result).toBe("2024-01-15 12:00:00 EST");
      });
    });

    describe("Asia/Tokyo", () => {
      it("should format JST time with offset fallback", () => {
        const date = new Date("2024-07-15T03:00:00Z"); // UTC 3am
        const result = toTimezoneString(date, "Asia/Tokyo");
        // Tokyo doesn't have preferred abbreviations, should use offset
        expect(result).toBe("2024-07-15 12:00:00 GMT+09:00");
      });
    });

    it("should default to Europe/London when no timezone specified", () => {
      const summerDate = new Date("2024-07-15T12:00:00Z");
      const result = toTimezoneString(summerDate);
      expect(result).toBe("2024-07-15 13:00:00 BST");
    });

    it("should handle midnight correctly", () => {
      const midnight = new Date("2024-07-15T23:00:00Z"); // UTC 11pm = London midnight BST
      const result = toTimezoneString(midnight, "Europe/London");
      expect(result).toBe("2024-07-16 00:00:00 BST");
    });

    it("should zero-pad all components", () => {
      const date = new Date("2024-01-05T08:05:05Z"); // Single digits
      const result = toTimezoneString(date, "Europe/London");
      expect(result).toBe("2024-01-05 08:05:05 GMT");
    });

    it("should throw error for invalid dates", () => {
      expect(() => toTimezoneString(new Date("invalid"))).toThrow(
        "Invalid date: date is NaN"
      );
    });

    it("should throw error for unsupported timezones", () => {
      const date = new Date("2024-07-15T12:00:00Z");
      expect(() => toTimezoneString(date, "Invalid/Timezone")).toThrow(
        "Timezone 'Invalid/Timezone' not available on this system"
      );
    });

    it("should throw error for invalid timezone parameter", () => {
      const date = new Date("2024-07-15T12:00:00Z");
      expect(() => toTimezoneString(date, "")).toThrow("Invalid timezone");
    });
  });

  describe("toLondonString", () => {
    it("should be a convenience function for Europe/London formatting", () => {
      const summerDate = new Date("2024-07-15T12:00:00Z");
      const winterDate = new Date("2024-01-15T12:00:00Z");

      expect(toLondonString(summerDate)).toBe("2024-07-15 13:00:00 BST");
      expect(toLondonString(winterDate)).toBe("2024-01-15 12:00:00 GMT");

      // Should match toTimezoneString for Europe/London
      expect(toLondonString(summerDate)).toBe(
        toTimezoneString(summerDate, "Europe/London")
      );
      expect(toLondonString(winterDate)).toBe(
        toTimezoneString(winterDate, "Europe/London")
      );
    });

    it("should throw error for invalid dates", () => {
      expect(() => toLondonString(new Date("invalid"))).toThrow(
        "Invalid date: date is NaN"
      );
    });
  });

  describe("Cross-timezone consistency", () => {
    it("should format the same UTC moment differently across timezones", () => {
      const utcMoment = new Date("2024-07-15T12:00:00Z");

      const london = toTimezoneString(utcMoment, "Europe/London");
      const newYork = toTimezoneString(utcMoment, "America/New_York");

      expect(london).toBe("2024-07-15 13:00:00 BST");
      expect(newYork).toBe("2024-07-15 08:00:00 EDT");
    });
  });
});
