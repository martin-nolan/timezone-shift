/**
 * Tests for DST transition date utilities
 */

import { describe, it, expect } from "vitest";
import {
  dstTransitionDates,
  clockChangeDates,
  nextDstTransition,
  nextClockChange,
} from "./dst-transitions.js";

describe("DST Transitions", () => {
  describe("dstTransitionDates", () => {
    describe("Europe/London", () => {
      it("should return BST transition dates for 2024", () => {
        const transitions = dstTransitionDates(2024, "Europe/London");

        expect(transitions).not.toBeNull();
        expect(transitions!.dstStartUtc).toBeInstanceOf(Date);
        expect(transitions!.dstEndUtc).toBeInstanceOf(Date);

        // BST starts last Sunday in March (March 31, 2024)
        expect(transitions!.dstStartUtc.getUTCMonth()).toBe(2); // March (0-indexed)
        expect(transitions!.dstStartUtc.getUTCDate()).toBe(31);
        expect(transitions!.dstStartUtc.getUTCHours()).toBe(1); // 01:00 UTC

        // BST ends last Sunday in October (October 27, 2024)
        expect(transitions!.dstEndUtc.getUTCMonth()).toBe(9); // October (0-indexed)
        expect(transitions!.dstEndUtc.getUTCDate()).toBe(27);
        expect(transitions!.dstEndUtc.getUTCHours()).toBe(1); // 01:00 UTC
      });

      it("should return consistent results across multiple years", () => {
        const years = [2020, 2021, 2022, 2023, 2024, 2025];

        for (const year of years) {
          const transitions = dstTransitionDates(year, "Europe/London");

          expect(transitions).not.toBeNull();
          expect(transitions!.dstStartUtc.getFullYear()).toBe(year);
          expect(transitions!.dstEndUtc.getFullYear()).toBe(year);

          // BST always starts in March and ends in October
          expect(transitions!.dstStartUtc.getUTCMonth()).toBe(2); // March
          expect(transitions!.dstEndUtc.getUTCMonth()).toBe(9); // October

          // Always at 01:00 UTC
          expect(transitions!.dstStartUtc.getUTCHours()).toBe(1);
          expect(transitions!.dstEndUtc.getUTCHours()).toBe(1);
        }
      });
    });

    describe("America/New_York", () => {
      it("should return EDT transition dates for 2024", () => {
        const transitions = dstTransitionDates(2024, "America/New_York");

        expect(transitions).not.toBeNull();
        expect(transitions!.dstStartUtc).toBeInstanceOf(Date);
        expect(transitions!.dstEndUtc).toBeInstanceOf(Date);

        // EDT starts second Sunday in March
        expect(transitions!.dstStartUtc.getUTCMonth()).toBe(2); // March
        expect(transitions!.dstStartUtc.getUTCDate()).toBeGreaterThanOrEqual(8); // Second Sunday
        expect(transitions!.dstStartUtc.getUTCDate()).toBeLessThanOrEqual(14);

        // EDT ends first Sunday in November
        expect(transitions!.dstEndUtc.getUTCMonth()).toBe(10); // November
        expect(transitions!.dstEndUtc.getUTCDate()).toBeGreaterThanOrEqual(1); // First Sunday
        expect(transitions!.dstEndUtc.getUTCDate()).toBeLessThanOrEqual(7);
      });
    });

    describe("Asia/Tokyo (no DST)", () => {
      it("should return null for timezones without DST", () => {
        const transitions = dstTransitionDates(2024, "Asia/Tokyo");
        expect(transitions).toBeNull();
      });
    });

    it("should default to Europe/London when no timezone specified", () => {
      const transitions = dstTransitionDates(2024);
      expect(transitions).not.toBeNull();
      expect(transitions!.dstStartUtc.getUTCMonth()).toBe(2); // March
      expect(transitions!.dstEndUtc.getUTCMonth()).toBe(9); // October
    });

    it("should throw error for invalid years", () => {
      expect(() => dstTransitionDates(1969)).toThrow("Invalid year");
      expect(() => dstTransitionDates(2101)).toThrow("Invalid year");
    });

    it("should throw error for unsupported timezones", () => {
      expect(() => dstTransitionDates(2024, "Invalid/Timezone")).toThrow(
        "Unsupported timezone"
      );
    });
  });

  describe("clockChangeDates", () => {
    it("should be a convenience function for Europe/London DST transitions", () => {
      const clockChanges = clockChangeDates(2024);
      const dstTransitions = dstTransitionDates(2024, "Europe/London");

      expect(clockChanges.bstStartUtc).toEqual(dstTransitions!.dstStartUtc);
      expect(clockChanges.bstEndUtc).toEqual(dstTransitions!.dstEndUtc);
    });

    it("should return BST-specific property names", () => {
      const clockChanges = clockChangeDates(2024);

      expect(clockChanges).toHaveProperty("bstStartUtc");
      expect(clockChanges).toHaveProperty("bstEndUtc");
      expect(clockChanges.bstStartUtc).toBeInstanceOf(Date);
      expect(clockChanges.bstEndUtc).toBeInstanceOf(Date);
    });
  });

  describe("nextDstTransition", () => {
    describe("Europe/London", () => {
      it("should find next BST start when in GMT period", () => {
        // January 15, 2024 - in GMT, next transition should be BST start
        const winterDate = new Date("2024-01-15T12:00:00Z");
        const nextTransition = nextDstTransition(winterDate, "Europe/London");

        expect(nextTransition).not.toBeNull();
        expect(nextTransition!.type).toBe("start");
        expect(nextTransition!.year).toBe(2024);
        expect(nextTransition!.whenUtc.getUTCMonth()).toBe(2); // March
      });

      it("should find next BST end when in BST period", () => {
        // July 15, 2024 - in BST, next transition should be BST end
        const summerDate = new Date("2024-07-15T12:00:00Z");
        const nextTransition = nextDstTransition(summerDate, "Europe/London");

        expect(nextTransition).not.toBeNull();
        expect(nextTransition!.type).toBe("end");
        expect(nextTransition!.year).toBe(2024);
        expect(nextTransition!.whenUtc.getUTCMonth()).toBe(9); // October
      });

      it("should find next year transition when late in current year", () => {
        // December 15, 2024 - next transition should be 2025 BST start
        const lateYearDate = new Date("2024-12-15T12:00:00Z");
        const nextTransition = nextDstTransition(lateYearDate, "Europe/London");

        expect(nextTransition).not.toBeNull();
        expect(nextTransition!.type).toBe("start");
        expect(nextTransition!.year).toBe(2025);
        expect(nextTransition!.whenUtc.getUTCMonth()).toBe(2); // March
      });
    });

    describe("Asia/Tokyo (no DST)", () => {
      it("should return null for timezones without DST", () => {
        const date = new Date("2024-07-15T12:00:00Z");
        const nextTransition = nextDstTransition(date, "Asia/Tokyo");
        expect(nextTransition).toBeNull();
      });
    });

    it("should default to Europe/London when no timezone specified", () => {
      const winterDate = new Date("2024-01-15T12:00:00Z");
      const nextTransition = nextDstTransition(winterDate);

      expect(nextTransition).not.toBeNull();
      expect(nextTransition!.type).toBe("start");
    });

    it("should use current date when no from date specified", () => {
      const nextTransition = nextDstTransition();

      // Should find some transition (or null for non-DST timezones)
      // We can't assert specific values since it depends on current date
      expect(
        nextTransition === null || nextTransition.whenUtc instanceof Date
      ).toBe(true);
    });

    it("should throw error for invalid dates", () => {
      expect(() => nextDstTransition(new Date("invalid"))).toThrow(
        "Invalid date: date is NaN"
      );
    });

    it("should throw error for unsupported timezones", () => {
      const date = new Date("2024-07-15T12:00:00Z");
      expect(() => nextDstTransition(date, "Invalid/Timezone")).toThrow(
        "Unsupported timezone"
      );
    });
  });

  describe("nextClockChange", () => {
    it("should be a convenience function for Europe/London next DST transition", () => {
      const winterDate = new Date("2024-01-15T12:00:00Z");

      const clockChange = nextClockChange(winterDate);
      const dstTransition = nextDstTransition(winterDate, "Europe/London");

      expect(clockChange!.whenUtc).toEqual(dstTransition!.whenUtc);
      expect(clockChange!.type).toBe(dstTransition!.type);
      expect(clockChange!.year).toBe(dstTransition!.year);
    });

    it("should use current date when no from date specified", () => {
      const clockChange = nextClockChange();

      // Should find some clock change (or null in edge cases)
      expect(clockChange === null || clockChange.whenUtc instanceof Date).toBe(
        true
      );
    });
  });

  describe("Cross-year consistency", () => {
    it("should maintain consistent transition patterns across years", () => {
      const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

      for (const year of years) {
        const transitions = dstTransitionDates(year, "Europe/London");

        expect(transitions).not.toBeNull();

        // BST should always start before it ends in the same year
        expect(transitions!.dstStartUtc.getTime()).toBeLessThan(
          transitions!.dstEndUtc.getTime()
        );

        // Transitions should be approximately 6-7 months apart
        const durationMonths =
          (transitions!.dstEndUtc.getTime() -
            transitions!.dstStartUtc.getTime()) /
          (1000 * 60 * 60 * 24 * 30);
        expect(durationMonths).toBeGreaterThan(6);
        expect(durationMonths).toBeLessThan(8);
      }
    });
  });

  describe("Transition timing accuracy", () => {
    it("should find transitions at expected times for Europe/London", () => {
      const transitions = dstTransitionDates(2024, "Europe/London");

      expect(transitions).not.toBeNull();

      // BST transitions happen at 01:00 UTC
      expect(transitions!.dstStartUtc.getUTCHours()).toBe(1);
      expect(transitions!.dstStartUtc.getUTCMinutes()).toBe(0);
      expect(transitions!.dstEndUtc.getUTCHours()).toBe(1);
      expect(transitions!.dstEndUtc.getUTCMinutes()).toBe(0);
    });
  });
});
