/**
 * Tests for timezone registry functionality
 */

import { describe, it, expect } from "vitest";
import {
  getTimezoneMetadata,
  isSupportedTimezone,
  validatePlatformTimezone,
  getSupportedTimezones,
  TIMEZONE_REGISTRY,
} from "./timezone-registry.js";

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
    it("should contain all expected timezones with correct metadata", () => {
      // Test Europe/London
      expect(TIMEZONE_REGISTRY["Europe/London"]).toEqual({
        id: "Europe/London",
        standardOffset: 0,
        dstOffset: 60,
        preferredAbbreviations: { standard: "GMT", dst: "BST" },
        fallbackFormat: "GMT{offset}",
      });

      // Test Asia/Tokyo (no DST)
      expect(TIMEZONE_REGISTRY["Asia/Tokyo"]).toEqual({
        id: "Asia/Tokyo",
        standardOffset: 540,
        fallbackFormat: "GMT{offset}",
      });

      // Test America/New_York
      expect(TIMEZONE_REGISTRY["America/New_York"]).toEqual({
        id: "America/New_York",
        standardOffset: -300,
        dstOffset: -240,
        preferredAbbreviations: { standard: "EST", dst: "EDT" },
        fallbackFormat: "GMT{offset}",
      });
    });
  });
});
