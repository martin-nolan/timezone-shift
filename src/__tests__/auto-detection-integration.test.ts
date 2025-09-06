/**
 * Integration tests for auto-detection with existing functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isDST,
  toTimezoneParts,
  fromTimezoneParts,
  toTimezoneString,
  inWorkingHours,
  isWorkingDay,
} from "../index.js";
import { timezoneDetector } from "../timezone-detector.js";

describe("Auto-detection integration with existing functions", () => {
  let detectorSpy: any;

  beforeEach(() => {
    // Reset timezone detector to auto-detection
    timezoneDetector.resetDefaultTimezone();
    vi.clearAllMocks();

    // Create a spy that we can control in each test
    detectorSpy = vi.spyOn(timezoneDetector, "getDetectedTimezone");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("isDST with auto-detection", () => {
    it("should use auto-detected timezone when no timezone provided", () => {
      // Mock timezone detector to return a known timezone
      detectorSpy.mockReturnValue("Europe/London");

      const summerDate = new Date("2024-07-15T12:00:00.000Z");
      const result = isDST(summerDate);

      expect(typeof result).toBe("boolean");
      expect(detectorSpy).toHaveBeenCalled();
    });

    it("should still work with explicit timezone", () => {
      const summerDate = new Date("2024-07-15T12:00:00.000Z");

      // Test with explicit timezone (should not call detector)
      const result = isDST(summerDate, "Europe/London");

      expect(typeof result).toBe("boolean");
      expect(detectorSpy).not.toHaveBeenCalled();
    });
  });

  describe("toTimezoneParts with auto-detection", () => {
    it("should use auto-detected timezone when no timezone provided", () => {
      // Mock timezone detector to return a known timezone
      detectorSpy.mockReturnValue("America/New_York");

      const testDate = new Date("2024-07-15T16:00:00.000Z");

      // Test with auto-detection
      const result = toTimezoneParts(testDate);

      expect(result).toHaveProperty("year");
      expect(result).toHaveProperty("month");
      expect(result).toHaveProperty("day");
      expect(result).toHaveProperty("hour");
      expect(result).toHaveProperty("minute");
      expect(result).toHaveProperty("second");
      expect(detectorSpy).toHaveBeenCalledTimes(1);
    });

    it("should still work with explicit timezone", () => {
      const testDate = new Date("2024-07-15T16:00:00.000Z");

      // Test with explicit timezone (should not call detector)
      const result = toTimezoneParts(testDate, "America/New_York");

      expect(result).toHaveProperty("year");
      expect(detectorSpy).not.toHaveBeenCalled();
    });
  });

  describe("fromTimezoneParts with auto-detection", () => {
    it("should use auto-detected timezone when no timezone provided", () => {
      // Mock timezone detector to return a known timezone
      detectorSpy.mockReturnValue("Europe/London");

      const parts = {
        year: 2024,
        month: 7,
        day: 15,
        hour: 14,
        minute: 30,
        second: 0,
      };

      // Test with auto-detection
      const result = fromTimezoneParts(parts);

      expect(result).toBeInstanceOf(Date);
      expect(detectorSpy).toHaveBeenCalledTimes(1);
    });

    it("should still work with explicit timezone", () => {
      const parts = {
        year: 2024,
        month: 7,
        day: 15,
        hour: 14,
        minute: 30,
        second: 0,
      };

      // Test with explicit timezone (should not call detector)
      const result = fromTimezoneParts(parts, "Europe/London");

      expect(result).toBeInstanceOf(Date);
      expect(detectorSpy).not.toHaveBeenCalled();
    });
  });

  describe("toTimezoneString with auto-detection", () => {
    it("should use auto-detected timezone when no timezone provided", () => {
      // Mock timezone detector to return a known timezone
      detectorSpy.mockReturnValue("Europe/London");

      const testDate = new Date("2024-07-15T12:00:00.000Z");

      // Test with auto-detection
      const result = toTimezoneString(testDate);

      expect(typeof result).toBe("string");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \w+$/);
      expect(detectorSpy).toHaveBeenCalledTimes(1);
    });

    it("should still work with explicit timezone", () => {
      const testDate = new Date("2024-07-15T12:00:00.000Z");

      // Test with explicit timezone (should not call detector)
      const result = toTimezoneString(testDate, "Europe/London");

      expect(typeof result).toBe("string");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \w+$/);
      expect(detectorSpy).not.toHaveBeenCalled();
    });
  });

  describe("inWorkingHours with auto-detection", () => {
    it("should use auto-detected timezone when no timezone provided", () => {
      // Mock timezone detector to return a known timezone
      detectorSpy.mockReturnValue("Europe/London");

      const testDate = new Date("2024-07-15T13:00:00.000Z"); // 2 PM BST

      // Test with auto-detection
      const result = inWorkingHours(testDate);

      expect(typeof result).toBe("boolean");
      expect(detectorSpy).toHaveBeenCalledTimes(1);
    });

    it("should still work with explicit timezone", () => {
      const testDate = new Date("2024-07-15T13:00:00.000Z");

      // Test with explicit timezone (should not call detector)
      const result = inWorkingHours(testDate, "Europe/London");

      expect(typeof result).toBe("boolean");
      expect(detectorSpy).not.toHaveBeenCalled();
    });

    it("should work with custom working hours and auto-detection", () => {
      // Mock timezone detector to return a known timezone
      detectorSpy.mockReturnValue("America/New_York");

      const testDate = new Date("2024-07-15T13:00:00.000Z");

      // Test with auto-detection and custom hours
      const result = inWorkingHours(testDate, undefined, "08:00", "18:00");

      expect(typeof result).toBe("boolean");
      expect(detectorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("isWorkingDay with auto-detection", () => {
    it("should use auto-detected timezone when no timezone provided", () => {
      // Mock timezone detector to return a known timezone
      detectorSpy.mockReturnValue("Asia/Tokyo");

      const testDate = new Date("2024-07-15T15:00:00.000Z"); // Monday in most timezones

      // Test with auto-detection
      const result = isWorkingDay(testDate);

      expect(typeof result).toBe("boolean");
      expect(detectorSpy).toHaveBeenCalledTimes(1);
    });

    it("should still work with explicit timezone", () => {
      const testDate = new Date("2024-07-15T15:00:00.000Z");

      // Test with explicit timezone (should not call detector)
      const result = isWorkingDay(testDate, "Asia/Tokyo");

      expect(typeof result).toBe("boolean");
      expect(detectorSpy).not.toHaveBeenCalled();
    });
  });

  describe("Backward compatibility", () => {
    it("should maintain exact same behavior for explicit timezone calls", () => {
      const testDate = new Date("2024-07-15T12:00:00.000Z");
      const parts = {
        year: 2024,
        month: 7,
        day: 15,
        hour: 14,
        minute: 30,
        second: 0,
      };

      // All these calls should work exactly as before
      expect(() => isDST(testDate, "Europe/London")).not.toThrow();
      expect(() => toTimezoneParts(testDate, "Europe/London")).not.toThrow();
      expect(() => fromTimezoneParts(parts, "Europe/London")).not.toThrow();
      expect(() => toTimezoneString(testDate, "Europe/London")).not.toThrow();
      expect(() =>
        inWorkingHours(testDate, "Europe/London", "09:00", "17:30")
      ).not.toThrow();
      expect(() => isWorkingDay(testDate, "Europe/London")).not.toThrow();

      // Timezone detector should never be called for explicit timezone usage
      expect(detectorSpy).not.toHaveBeenCalled();
    });

    it("should handle runtime timezones with auto-detection", () => {
      // Set a runtime timezone
      timezoneDetector.setDefaultTimezone("America/Chicago");

      const testDate = new Date("2024-07-15T12:00:00.000Z");

      // Test that auto-detection works with runtime timezones
      const dstResult = isDST(testDate);
      const partsResult = toTimezoneParts(testDate);
      const stringResult = toTimezoneString(testDate);
      const workingResult = inWorkingHours(testDate);

      expect(typeof dstResult).toBe("boolean");
      expect(partsResult).toHaveProperty("year");
      expect(typeof stringResult).toBe("string");
      expect(typeof workingResult).toBe("boolean");
    });
  });

  describe("Error handling", () => {
    it("should propagate timezone detection errors", () => {
      // Mock timezone detector to throw an error
      detectorSpy.mockImplementation(() => {
        throw new Error("Detection failed");
      });

      const testDate = new Date("2024-07-15T12:00:00.000Z");

      // All functions should propagate the detection error
      expect(() => isDST(testDate)).toThrow("Detection failed");
      expect(() => toTimezoneParts(testDate)).toThrow("Detection failed");
      expect(() => toTimezoneString(testDate)).toThrow("Detection failed");
      expect(() => inWorkingHours(testDate)).toThrow("Detection failed");
    });
  });
});
