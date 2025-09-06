/**
 * Tests for time conversion functionality
 */

import { describe, it, expect } from "vitest";
import {
  toTimezoneParts,
  toLondonParts,
  fromTimezoneParts,
  fromLondonParts,
} from "../../time-converter.js";

describe("Time Converter", () => {
  describe("toTimezoneParts", () => {
    describe("Europe/London", () => {
      it("should extract BST time parts correctly", () => {
        const summerDate = new Date("2024-07-15T12:00:00Z"); // UTC noon in July
        const parts = toTimezoneParts(summerDate, "Europe/London");

        expect(parts).toEqual({
          year: 2024,
          month: 7,
          day: 15,
          hour: 13, // BST = UTC+1
          minute: 0,
          second: 0,
        });
      });

      it("should extract GMT time parts correctly", () => {
        const winterDate = new Date("2024-01-15T12:00:00Z"); // UTC noon in January
        const parts = toTimezoneParts(winterDate, "Europe/London");

        expect(parts).toEqual({
          year: 2024,
          month: 1,
          day: 15,
          hour: 12, // GMT = UTC+0
          minute: 0,
          second: 0,
        });
      });
    });

    describe("America/New_York", () => {
      it("should extract EDT time parts correctly", () => {
        const summerDate = new Date("2024-07-15T16:00:00Z"); // UTC 4pm in July
        const parts = toTimezoneParts(summerDate, "America/New_York");

        expect(parts).toEqual({
          year: 2024,
          month: 7,
          day: 15,
          hour: 12, // EDT = UTC-4
          minute: 0,
          second: 0,
        });
      });

      it("should extract EST time parts correctly", () => {
        const winterDate = new Date("2024-01-15T17:00:00Z"); // UTC 5pm in January
        const parts = toTimezoneParts(winterDate, "America/New_York");

        expect(parts).toEqual({
          year: 2024,
          month: 1,
          day: 15,
          hour: 12, // EST = UTC-5
          minute: 0,
          second: 0,
        });
      });
    });

    describe("Asia/Tokyo", () => {
      it("should extract JST time parts correctly", () => {
        const date = new Date("2024-07-15T03:00:00Z"); // UTC 3am
        const parts = toTimezoneParts(date, "Asia/Tokyo");

        expect(parts).toEqual({
          year: 2024,
          month: 7,
          day: 15,
          hour: 12, // JST = UTC+9
          minute: 0,
          second: 0,
        });
      });
    });

    it("should default to Europe/London when no timezone specified", () => {
      const summerDate = new Date("2024-07-15T12:00:00Z");
      const parts = toTimezoneParts(summerDate);

      expect(parts).toEqual({
        year: 2024,
        month: 7,
        day: 15,
        hour: 13, // BST
        minute: 0,
        second: 0,
      });
    });

    it("should handle all time components correctly", () => {
      const date = new Date("2024-07-15T14:35:42Z");
      const parts = toTimezoneParts(date, "Europe/London");

      expect(parts).toEqual({
        year: 2024,
        month: 7,
        day: 15,
        hour: 15, // BST = UTC+1
        minute: 35,
        second: 42,
      });
    });

    it("should throw error for invalid dates", () => {
      expect(() => toTimezoneParts(new Date("invalid"))).toThrow(
        "Invalid date: date is NaN"
      );
    });

    it("should throw error for unsupported timezones", () => {
      const date = new Date("2024-07-15T12:00:00Z");
      expect(() => toTimezoneParts(date, "Invalid/Timezone")).toThrow(
        "Timezone 'Invalid/Timezone' not available on this system"
      );
    });
  });

  describe("toLondonParts", () => {
    it("should be a convenience function for Europe/London parts extraction", () => {
      const summerDate = new Date("2024-07-15T12:00:00Z");
      const winterDate = new Date("2024-01-15T12:00:00Z");

      const summerParts = toLondonParts(summerDate);
      const winterParts = toLondonParts(winterDate);

      expect(summerParts.hour).toBe(13); // BST
      expect(winterParts.hour).toBe(12); // GMT

      // Should match toTimezoneParts for Europe/London
      expect(summerParts).toEqual(toTimezoneParts(summerDate, "Europe/London"));
      expect(winterParts).toEqual(toTimezoneParts(winterDate, "Europe/London"));
    });
  });

  describe("fromTimezoneParts", () => {
    describe("Normal cases", () => {
      it("should create UTC date from London BST parts", () => {
        const parts = {
          year: 2024,
          month: 7,
          day: 15,
          hour: 13, // BST
          minute: 30,
          second: 45,
        };

        const result = fromTimezoneParts(parts, "Europe/London");
        expect(result.toISOString()).toBe("2024-07-15T12:30:45.000Z"); // UTC = BST-1
      });

      it("should create UTC date from London GMT parts", () => {
        const parts = {
          year: 2024,
          month: 1,
          day: 15,
          hour: 12, // GMT
          minute: 30,
          second: 45,
        };

        const result = fromTimezoneParts(parts, "Europe/London");
        expect(result.toISOString()).toBe("2024-01-15T12:30:45.000Z"); // UTC = GMT
      });

      it("should create UTC date from New York EDT parts", () => {
        const parts = {
          year: 2024,
          month: 7,
          day: 15,
          hour: 8, // EDT
          minute: 0,
          second: 0,
        };

        const result = fromTimezoneParts(parts, "America/New_York");
        expect(result.toISOString()).toBe("2024-07-15T12:00:00.000Z"); // UTC = EDT+4
      });

      it("should create UTC date from Tokyo JST parts", () => {
        const parts = {
          year: 2024,
          month: 7,
          day: 15,
          hour: 21, // JST
          minute: 0,
          second: 0,
        };

        const result = fromTimezoneParts(parts, "Asia/Tokyo");
        expect(result.toISOString()).toBe("2024-07-15T12:00:00.000Z"); // UTC = JST-9
      });
    });

    describe("Round-trip conversion", () => {
      it("should maintain accuracy in round-trip conversions", () => {
        const originalDate = new Date("2024-07-15T14:35:42.123Z");

        // Convert to parts and back
        const parts = toTimezoneParts(originalDate, "Europe/London");
        const reconstructed = fromTimezoneParts(parts, "Europe/London");

        // Should be within 1 second (we lose milliseconds in parts)
        const timeDiff = Math.abs(
          reconstructed.getTime() - originalDate.getTime()
        );
        expect(timeDiff).toBeLessThan(1000);
      });
    });

    describe("DST edge cases", () => {
      it("should handle DST transitions gracefully", () => {
        // During spring forward, 01:30 doesn't exist - should resolve to valid time
        const gapParts = {
          year: 2024,
          month: 3,
          day: 31, // Last Sunday in March 2024
          hour: 1,
          minute: 30,
          second: 0,
        };

        // Should not throw error, should find a valid resolution
        expect(() =>
          fromTimezoneParts(gapParts, "Europe/London")
        ).not.toThrow();

        const result = fromTimezoneParts(gapParts, "Europe/London");
        expect(result).toBeInstanceOf(Date);
      });
    });

    it("should default to Europe/London when no timezone specified", () => {
      const parts = {
        year: 2024,
        month: 7,
        day: 15,
        hour: 13, // BST
        minute: 0,
        second: 0,
      };

      const result = fromTimezoneParts(parts);
      expect(result.toISOString()).toBe("2024-07-15T12:00:00.000Z");
    });

    it("should throw error for invalid time parts", () => {
      const invalidParts = {
        year: 2024,
        month: 13, // Invalid month
        day: 15,
        hour: 12,
        minute: 0,
        second: 0,
      };

      expect(() => fromTimezoneParts(invalidParts)).toThrow(
        "Invalid time parts"
      );
    });

    it("should throw error for unsupported timezones", () => {
      const parts = {
        year: 2024,
        month: 7,
        day: 15,
        hour: 12,
        minute: 0,
        second: 0,
      };

      expect(() => fromTimezoneParts(parts, "Invalid/Timezone")).toThrow(
        "Unsupported timezone"
      );
    });
  });

  describe("fromLondonParts", () => {
    it("should be a convenience function for Europe/London parts conversion", () => {
      const bstParts = {
        year: 2024,
        month: 7,
        day: 15,
        hour: 13, // BST
        minute: 30,
        second: 0,
      };

      const gmtParts = {
        year: 2024,
        month: 1,
        day: 15,
        hour: 12, // GMT
        minute: 30,
        second: 0,
      };

      const bstResult = fromLondonParts(bstParts);
      const gmtResult = fromLondonParts(gmtParts);

      // Should match fromTimezoneParts for Europe/London
      expect(bstResult).toEqual(fromTimezoneParts(bstParts, "Europe/London"));
      expect(gmtResult).toEqual(fromTimezoneParts(gmtParts, "Europe/London"));
    });
  });
});
