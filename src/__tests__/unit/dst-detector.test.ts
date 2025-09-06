/**
 * Tests for DST detection functionality
 */

import { describe, it, expect } from "vitest";
import { isDST, isBST } from "../../dst-detector.js";

describe("DST Detection", () => {
  describe("isDST", () => {
    describe("Europe/London (BST/GMT)", () => {
      it("should detect BST during summer months", () => {
        const summerDate = new Date("2024-07-15T12:00:00Z");
        expect(isDST(summerDate, "Europe/London")).toBe(true);
      });

      it("should detect GMT during winter months", () => {
        const winterDate = new Date("2024-01-15T12:00:00Z");
        expect(isDST(winterDate, "Europe/London")).toBe(false);
      });

      it("should handle DST transition periods correctly", () => {
        // Late March - should be BST after transition
        const lateMarsh = new Date("2024-04-01T12:00:00Z");
        expect(isDST(lateMarsh, "Europe/London")).toBe(true);

        // Early November - should be GMT after transition
        const earlyNovember = new Date("2024-11-15T12:00:00Z");
        expect(isDST(earlyNovember, "Europe/London")).toBe(false);
      });
    });

    describe("America/New_York (EDT/EST)", () => {
      it("should detect EDT during summer and EST during winter", () => {
        const summerDate = new Date("2024-07-15T12:00:00Z");
        const winterDate = new Date("2024-01-15T12:00:00Z");

        expect(isDST(summerDate, "America/New_York")).toBe(true);
        expect(isDST(winterDate, "America/New_York")).toBe(false);
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
});
