/**
 * Tests for DST detection functionality
 */

import { describe, it, expect } from "vitest";
import { isDST, isBST } from "./dst-detector.js";

describe("DST Detection", () => {
  describe("isDST", () => {
    describe("Europe/London (BST/GMT)", () => {
      it("should detect BST during summer months", () => {
        // July 15, 2024 - definitely BST
        const summerDate = new Date("2024-07-15T12:00:00Z");
        expect(isDST(summerDate, "Europe/London")).toBe(true);

        // August 1, 2024 - definitely BST
        const augustDate = new Date("2024-08-01T12:00:00Z");
        expect(isDST(augustDate, "Europe/London")).toBe(true);
      });

      it("should detect GMT during winter months", () => {
        // January 15, 2024 - definitely GMT
        const winterDate = new Date("2024-01-15T12:00:00Z");
        expect(isDST(winterDate, "Europe/London")).toBe(false);

        // December 1, 2024 - definitely GMT
        const decemberDate = new Date("2024-12-01T12:00:00Z");
        expect(isDST(decemberDate, "Europe/London")).toBe(false);
      });

      it("should handle DST transition periods correctly", () => {
        // Test dates around typical BST transitions
        // Note: Exact transition dates vary by year, so we test general periods

        // Late March - should be BST after transition
        const lateMarsh = new Date("2024-04-01T12:00:00Z");
        expect(isDST(lateMarsh, "Europe/London")).toBe(true);

        // Early November - should be GMT after transition
        const earlyNovember = new Date("2024-11-15T12:00:00Z");
        expect(isDST(earlyNovember, "Europe/London")).toBe(false);
      });
    });

    describe("America/New_York (EDT/EST)", () => {
      it("should detect EDT during summer months", () => {
        const summerDate = new Date("2024-07-15T12:00:00Z");
        expect(isDST(summerDate, "America/New_York")).toBe(true);
      });

      it("should detect EST during winter months", () => {
        const winterDate = new Date("2024-01-15T12:00:00Z");
        expect(isDST(winterDate, "America/New_York")).toBe(false);
      });
    });

    describe("America/Los_Angeles (PDT/PST)", () => {
      it("should detect PDT during summer months", () => {
        const summerDate = new Date("2024-07-15T12:00:00Z");
        expect(isDST(summerDate, "America/Los_Angeles")).toBe(true);
      });

      it("should detect PST during winter months", () => {
        const winterDate = new Date("2024-01-15T12:00:00Z");
        expect(isDST(winterDate, "America/Los_Angeles")).toBe(false);
      });
    });

    describe("Europe/Paris (CEST/CET)", () => {
      it("should detect CEST during summer months", () => {
        const summerDate = new Date("2024-07-15T12:00:00Z");
        expect(isDST(summerDate, "Europe/Paris")).toBe(true);
      });

      it("should detect CET during winter months", () => {
        const winterDate = new Date("2024-01-15T12:00:00Z");
        expect(isDST(winterDate, "Europe/Paris")).toBe(false);
      });
    });

    describe("Asia/Tokyo (no DST)", () => {
      it("should never be in DST", () => {
        const summerDate = new Date("2024-07-15T12:00:00Z");
        const winterDate = new Date("2024-01-15T12:00:00Z");

        expect(isDST(summerDate, "Asia/Tokyo")).toBe(false);
        expect(isDST(winterDate, "Asia/Tokyo")).toBe(false);
      });
    });

    describe("Australia/Sydney (AEDT/AEST)", () => {
      it("should detect AEDT during Australian summer (Northern Hemisphere winter)", () => {
        // January is summer in Australia
        const australianSummer = new Date("2024-01-15T12:00:00Z");
        expect(isDST(australianSummer, "Australia/Sydney")).toBe(true);
      });

      it("should detect AEST during Australian winter (Northern Hemisphere summer)", () => {
        // July is winter in Australia
        const australianWinter = new Date("2024-07-15T12:00:00Z");
        expect(isDST(australianWinter, "Australia/Sydney")).toBe(false);
      });
    });

    it("should default to Europe/London when no timezone specified", () => {
      const summerDate = new Date("2024-07-15T12:00:00Z");
      const winterDate = new Date("2024-01-15T12:00:00Z");

      expect(isDST(summerDate)).toBe(true); // Should be BST
      expect(isDST(winterDate)).toBe(false); // Should be GMT
    });

    it("should throw error for invalid dates", () => {
      expect(() => isDST(new Date("invalid"))).toThrow(
        "Invalid date: date is NaN"
      );
    });

    it("should throw error for unsupported timezones", () => {
      const date = new Date("2024-07-15T12:00:00Z");
      expect(() => isDST(date, "Invalid/Timezone")).toThrow(
        "Unsupported timezone"
      );
    });

    it("should throw error for invalid timezone parameter", () => {
      const date = new Date("2024-07-15T12:00:00Z");
      expect(() => isDST(date, "")).toThrow("Invalid timezone");
    });
  });

  describe("isBST", () => {
    it("should be a convenience function for Europe/London DST detection", () => {
      const summerDate = new Date("2024-07-15T12:00:00Z");
      const winterDate = new Date("2024-01-15T12:00:00Z");

      expect(isBST(summerDate)).toBe(true);
      expect(isBST(winterDate)).toBe(false);

      // Should match isDST for Europe/London
      expect(isBST(summerDate)).toBe(isDST(summerDate, "Europe/London"));
      expect(isBST(winterDate)).toBe(isDST(winterDate, "Europe/London"));
    });

    it("should throw error for invalid dates", () => {
      expect(() => isBST(new Date("invalid"))).toThrow(
        "Invalid date: date is NaN"
      );
    });
  });

  describe("Cross-year consistency", () => {
    it("should handle DST detection across multiple years", () => {
      const years = [2020, 2021, 2022, 2023, 2024, 2025];

      for (const year of years) {
        // Test summer date (July 15)
        const summerDate = new Date(`${year}-07-15T12:00:00Z`);
        expect(isDST(summerDate, "Europe/London")).toBe(true);

        // Test winter date (January 15)
        const winterDate = new Date(`${year}-01-15T12:00:00Z`);
        expect(isDST(winterDate, "Europe/London")).toBe(false);
      }
    });
  });

  describe("Edge cases around midnight", () => {
    it("should handle dates at midnight correctly", () => {
      const midnightSummer = new Date("2024-07-15T00:00:00Z");
      const midnightWinter = new Date("2024-01-15T00:00:00Z");

      expect(isDST(midnightSummer, "Europe/London")).toBe(true);
      expect(isDST(midnightWinter, "Europe/London")).toBe(false);
    });

    it("should handle dates at end of day correctly", () => {
      const endOfDaySummer = new Date("2024-07-15T23:59:59Z");
      const endOfDayWinter = new Date("2024-01-15T23:59:59Z");

      expect(isDST(endOfDaySummer, "Europe/London")).toBe(true);
      expect(isDST(endOfDayWinter, "Europe/London")).toBe(false);
    });
  });
});
