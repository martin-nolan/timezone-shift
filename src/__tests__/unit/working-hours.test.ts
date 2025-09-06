/**
 * Tests for working hours and business day functionality
 */

import { describe, it, expect } from "vitest";
import {
  inWorkingHours,
  inWorkingHoursLondon,
  isWorkingDay,
} from "../../working-hours.js";

describe("Working Hours", () => {
  describe("inWorkingHours", () => {
    describe("Europe/London", () => {
      it("should detect working hours during BST", () => {
        // July 15, 2024 is BST (UTC+1)
        const workingTime = new Date("2024-07-15T13:00:00Z"); // 14:00 BST
        const beforeWork = new Date("2024-07-15T07:00:00Z"); // 08:00 BST
        const afterWork = new Date("2024-07-15T17:00:00Z"); // 18:00 BST

        expect(inWorkingHours(workingTime, "Europe/London")).toBe(true);
        expect(inWorkingHours(beforeWork, "Europe/London")).toBe(false);
        expect(inWorkingHours(afterWork, "Europe/London")).toBe(false);
      });

      it("should detect working hours during GMT", () => {
        // January 15, 2024 is GMT (UTC+0)
        const workingTime = new Date("2024-01-15T14:00:00Z"); // 14:00 GMT
        const beforeWork = new Date("2024-01-15T08:00:00Z"); // 08:00 GMT
        const afterWork = new Date("2024-01-15T18:00:00Z"); // 18:00 GMT

        expect(inWorkingHours(workingTime, "Europe/London")).toBe(true);
        expect(inWorkingHours(beforeWork, "Europe/London")).toBe(false);
        expect(inWorkingHours(afterWork, "Europe/London")).toBe(false);
      });

      it("should handle exact start and end times", () => {
        // BST period
        const startTime = new Date("2024-07-15T08:00:00Z"); // 09:00 BST
        const endTime = new Date("2024-07-15T16:30:00Z"); // 17:30 BST

        expect(inWorkingHours(startTime, "Europe/London")).toBe(true);
        expect(inWorkingHours(endTime, "Europe/London")).toBe(true);
      });

      it("should handle custom working hours", () => {
        const time = new Date("2024-07-15T06:00:00Z"); // 07:00 BST

        // Default hours (09:00-17:30): should be false
        expect(inWorkingHours(time, "Europe/London")).toBe(false);

        // Custom hours (07:00-15:00): should be true
        expect(inWorkingHours(time, "Europe/London", "07:00", "15:00")).toBe(
          true
        );
      });
    });

    describe("America/New_York", () => {
      it("should detect working hours during EDT and EST", () => {
        // July 15, 2024 is EDT (UTC-4)
        const summerWorkingTime = new Date("2024-07-15T18:00:00Z"); // 14:00 EDT
        // January 15, 2024 is EST (UTC-5)
        const winterWorkingTime = new Date("2024-01-15T19:00:00Z"); // 14:00 EST

        expect(inWorkingHours(summerWorkingTime, "America/New_York")).toBe(
          true
        );
        expect(inWorkingHours(winterWorkingTime, "America/New_York")).toBe(
          true
        );
      });
    });

    it("should default to Europe/London when no timezone specified", () => {
      const workingTime = new Date("2024-07-15T13:00:00Z"); // 14:00 BST
      expect(inWorkingHours(workingTime)).toBe(true);
    });

    it("should handle midnight-spanning working hours", () => {
      const lateNight = new Date("2024-07-15T22:00:00Z"); // 23:00 BST
      const earlyMorning = new Date("2024-07-16T04:00:00Z"); // 05:00 BST
      const midDay = new Date("2024-07-15T13:00:00Z"); // 14:00 BST

      // Working hours: 22:00 to 06:00 (night shift)
      expect(inWorkingHours(lateNight, "Europe/London", "22:00", "06:00")).toBe(
        true
      );
      expect(
        inWorkingHours(earlyMorning, "Europe/London", "22:00", "06:00")
      ).toBe(true);
      expect(inWorkingHours(midDay, "Europe/London", "22:00", "06:00")).toBe(
        false
      );
    });

    it("should throw error for invalid dates", () => {
      expect(() => inWorkingHours(new Date("invalid"))).toThrow(
        "Invalid date: date is NaN"
      );
    });

    it("should throw error for invalid time strings", () => {
      const date = new Date("2024-07-15T12:00:00Z");
      expect(() => inWorkingHours(date, "Europe/London", "25:00")).toThrow(
        "Invalid time format"
      );
      expect(() =>
        inWorkingHours(date, "Europe/London", "09:00", "12:60")
      ).toThrow("Invalid time format");
    });

    it("should throw error for unsupported timezones", () => {
      const date = new Date("2024-07-15T12:00:00Z");
      expect(() => inWorkingHours(date, "Invalid/Timezone")).toThrow(
        "Timezone 'Invalid/Timezone' not available on this system"
      );
    });
  });

  describe("inWorkingHoursLondon", () => {
    it("should be a convenience function for Europe/London working hours", () => {
      const workingTime = new Date("2024-07-15T13:00:00Z"); // 14:00 BST
      const nonWorkingTime = new Date("2024-07-15T07:00:00Z"); // 08:00 BST

      expect(inWorkingHoursLondon(workingTime)).toBe(true);
      expect(inWorkingHoursLondon(nonWorkingTime)).toBe(false);

      // Should match inWorkingHours for Europe/London
      expect(inWorkingHoursLondon(workingTime)).toBe(
        inWorkingHours(workingTime, "Europe/London")
      );
      expect(inWorkingHoursLondon(nonWorkingTime)).toBe(
        inWorkingHours(nonWorkingTime, "Europe/London")
      );
    });

    it("should handle custom working hours", () => {
      const earlyTime = new Date("2024-07-15T06:00:00Z"); // 07:00 BST

      expect(inWorkingHoursLondon(earlyTime)).toBe(false); // Default hours
      expect(inWorkingHoursLondon(earlyTime, "07:00", "15:00")).toBe(true); // Custom hours
    });
  });

  describe("isWorkingDay", () => {
    describe("Default working days (Monday-Friday)", () => {
      it("should detect weekdays as working days", () => {
        const monday = new Date("2024-07-15T12:00:00Z"); // Monday
        const friday = new Date("2024-07-19T12:00:00Z"); // Friday

        expect(isWorkingDay(monday, "Europe/London")).toBe(true);
        expect(isWorkingDay(friday, "Europe/London")).toBe(true);
      });

      it("should detect weekends as non-working days", () => {
        const saturday = new Date("2024-07-20T12:00:00Z"); // Saturday
        const sunday = new Date("2024-07-21T12:00:00Z"); // Sunday

        expect(isWorkingDay(saturday, "Europe/London")).toBe(false);
        expect(isWorkingDay(sunday, "Europe/London")).toBe(false);
      });
    });

    describe("Timezone-aware day calculation", () => {
      it("should use timezone-local date for day calculation", () => {
        // This is Friday 23:00 UTC, but Saturday 00:00 BST
        const fridayUTCSaturdayBST = new Date("2024-07-19T23:00:00Z");

        // In London timezone context, this is Saturday (non-working day)
        expect(isWorkingDay(fridayUTCSaturdayBST, "Europe/London")).toBe(false);
      });
    });

    describe("Custom working days", () => {
      it("should handle custom working days configuration", () => {
        const saturday = new Date("2024-07-20T12:00:00Z"); // Saturday
        const monday = new Date("2024-07-15T12:00:00Z"); // Monday

        // Custom: only weekends are working days
        const weekendOnly = [0, 6]; // Sunday, Saturday

        expect(isWorkingDay(saturday, "Europe/London", weekendOnly)).toBe(true);
        expect(isWorkingDay(monday, "Europe/London", weekendOnly)).toBe(false);
      });

      it("should handle no working days", () => {
        const noWorkingDays: number[] = [];
        const monday = new Date("2024-07-15T12:00:00Z"); // Monday

        expect(isWorkingDay(monday, "Europe/London", noWorkingDays)).toBe(
          false
        );
      });
    });

    it("should default to Europe/London when no timezone specified", () => {
      const monday = new Date("2024-07-15T12:00:00Z"); // Monday
      expect(isWorkingDay(monday)).toBe(true);
    });

    it("should throw error for invalid dates", () => {
      expect(() => isWorkingDay(new Date("invalid"))).toThrow(
        "Invalid date: date is NaN"
      );
    });

    it("should throw error for invalid working days", () => {
      const date = new Date("2024-07-15T12:00:00Z");
      expect(() => isWorkingDay(date, "Europe/London", [7])).toThrow(
        "Invalid working day: 7"
      );
      expect(() => isWorkingDay(date, "Europe/London", [-1])).toThrow(
        "Invalid working day: -1"
      );
      expect(() => isWorkingDay(date, "Europe/London", [1, 1, 2])).toThrow(
        "Invalid working days: contains duplicates"
      );
    });

    it("should throw error for unsupported timezones", () => {
      const date = new Date("2024-07-15T12:00:00Z");
      expect(() => isWorkingDay(date, "Invalid/Timezone")).toThrow(
        "Timezone 'Invalid/Timezone' not available on this system"
      );
    });
  });
});
