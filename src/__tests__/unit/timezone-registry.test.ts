/**
 * Tests for timezone registry functionality
 */

import { describe, it, expect } from "vitest";
import {
  getTimezoneMetadata,
  isSupportedTimezone,
  getSupportedTimezones,
  TIMEZONE_REGISTRY,
} from "../../timezone-registry.js";
import { validatePlatformTimezone } from "../../utils/validation.js";

describe("Timezone Registry", () => {
  describe("getTimezoneMetadata", () => {
    it("should return metadata for supported timezones", () => {
      const londonMeta = getTimezoneMetadata("Europe/London");
      expect(londonMeta).toEqual({
        id: "Europe/London",
        standardOffset: 0,
        dstOffset: 60,
        preferredAbbreviations: {
          standard: "GMT",
          dst: "BST",
        },
        fallbackFormat: "GMT{offset}",
      });
    });

    it("should throw error for unsupported timezone", () => {
      expect(() => getTimezoneMetadata("Invalid/Timezone")).toThrow(
        "Unsupported timezone: Invalid/Timezone"
      );
    });
  });

  describe("isSupportedTimezone", () => {
    it("should return true for supported timezones", () => {
      expect(isSupportedTimezone("Europe/London")).toBe(true);
      expect(isSupportedTimezone("America/New_York")).toBe(true);
      expect(isSupportedTimezone("Asia/Tokyo")).toBe(true);
    });

    it("should return false for unsupported timezones", () => {
      expect(isSupportedTimezone("Invalid/Timezone")).toBe(false);
      expect(isSupportedTimezone("")).toBe(false);
    });
  });

  describe("validatePlatformTimezone", () => {
    it("should not throw for supported timezones", () => {
      expect(() => validatePlatformTimezone("Europe/London")).not.toThrow();
      expect(() => validatePlatformTimezone("America/New_York")).not.toThrow();
    });

    it("should throw for invalid timezones", () => {
      expect(() => validatePlatformTimezone("Invalid/Timezone")).toThrow(
        "Timezone 'Invalid/Timezone' not available on this system"
      );
    });
  });

  describe("getSupportedTimezones", () => {
    it("should return all supported timezone identifiers", () => {
      const timezones = getSupportedTimezones();
      expect(timezones).toContain("Europe/London");
      expect(timezones).toContain("America/New_York");
      expect(timezones).toContain("America/Los_Angeles");
      expect(timezones).toContain("Europe/Paris");
      expect(timezones).toContain("Europe/Berlin");
      expect(timezones).toContain("Asia/Tokyo");
      expect(timezones).toContain("Australia/Sydney");
      expect(timezones).toHaveLength(7);
    });
  });

  describe("TIMEZONE_REGISTRY", () => {
    it("should contain expected timezones with correct structure", () => {
      // Test Europe/London
      const london = TIMEZONE_REGISTRY["Europe/London"];
      expect(london.id).toBe("Europe/London");
      expect(london.standardOffset).toBe(0);
      expect(london.dstOffset).toBe(60);

      // Test Asia/Tokyo (no DST)
      const tokyo = TIMEZONE_REGISTRY["Asia/Tokyo"];
      expect(tokyo.id).toBe("Asia/Tokyo");
      expect(tokyo.standardOffset).toBe(540);
      expect(tokyo.dstOffset).toBeUndefined();
    });
  });
});
