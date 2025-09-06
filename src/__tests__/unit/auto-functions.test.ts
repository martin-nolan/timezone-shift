/**
 * Tests for auto-detection convenience functions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isDSTNow,
  getCurrentTimezoneParts,
  inWorkingHoursNow,
  formatNow,
} from "../../auto-functions.js";
import { timezoneDetector } from "../../timezone-detector.js";

describe("Auto-detection convenience functions", () => {
  beforeEach(() => {
    // Reset timezone detector to auto-detection
    timezoneDetector.resetDefaultTimezone();

    // Clear any cached detection results
    vi.clearAllMocks();

    // Enable fake timers for date mocking
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up any global mocks
    vi.restoreAllMocks();
    // Reset system time
    vi.useRealTimers();
  });

  describe("isDSTNow", () => {
    it("should check DST status for auto-detected timezone", () => {
      // Mock timezone detector to return a known timezone
      vi.spyOn(timezoneDetector, "getDetectedTimezone").mockReturnValue(
        "Europe/London"
      );

      // Mock current date to be in summer (BST period)
      vi.setSystemTime(new Date("2024-07-15T12:00:00.000Z"));

      const result = isDSTNow();

      expect(typeof result).toBe("boolean");
      expect(timezoneDetector.getDetectedTimezone).toHaveBeenCalled();
    });

    it("should work with runtime timezones", () => {
      // Set a runtime timezone
      timezoneDetector.setDefaultTimezone("America/Chicago");

      const result = isDSTNow();

      expect(typeof result).toBe("boolean");
    });
  });

  describe("getCurrentTimezoneParts", () => {
    it("should return time parts for auto-detected timezone", () => {
      // Mock timezone detector to return a known timezone
      vi.spyOn(timezoneDetector, "getDetectedTimezone").mockReturnValue(
        "Europe/London"
      );

      // Mock current date
      vi.setSystemTime(new Date("2024-07-15T12:00:00.000Z"));

      const result = getCurrentTimezoneParts();

      expect(result).toHaveProperty("year");
      expect(result).toHaveProperty("month");
      expect(result).toHaveProperty("day");
      expect(result).toHaveProperty("hour");
      expect(result).toHaveProperty("minute");
      expect(result).toHaveProperty("second");
      expect(typeof result.year).toBe("number");
      expect(typeof result.month).toBe("number");
      expect(typeof result.day).toBe("number");
      expect(typeof result.hour).toBe("number");
      expect(typeof result.minute).toBe("number");
      expect(typeof result.second).toBe("number");
      expect(timezoneDetector.getDetectedTimezone).toHaveBeenCalled();
    });

    it("should work with runtime timezones", () => {
      // Set a runtime timezone
      timezoneDetector.setDefaultTimezone("America/Chicago");

      const result = getCurrentTimezoneParts();

      expect(result).toHaveProperty("year");
      expect(result).toHaveProperty("month");
      expect(result).toHaveProperty("day");
      expect(result).toHaveProperty("hour");
      expect(result).toHaveProperty("minute");
      expect(result).toHaveProperty("second");
    });
  });

  describe("inWorkingHoursNow", () => {
    it("should check working hours for auto-detected timezone with default hours", () => {
      // Mock timezone detector to return a known timezone
      vi.spyOn(timezoneDetector, "getDetectedTimezone").mockReturnValue(
        "Europe/London"
      );

      // Mock current date to be during working hours (2 PM UTC = 3 PM BST in summer)
      vi.setSystemTime(new Date("2024-07-15T14:00:00.000Z"));

      const result = inWorkingHoursNow();

      expect(typeof result).toBe("boolean");
      expect(timezoneDetector.getDetectedTimezone).toHaveBeenCalled();
    });

    it("should check working hours with custom hours", () => {
      // Mock timezone detector to return a known timezone
      vi.spyOn(timezoneDetector, "getDetectedTimezone").mockReturnValue(
        "Europe/London"
      );

      const result = inWorkingHoursNow("08:00", "20:00");

      expect(typeof result).toBe("boolean");
      expect(timezoneDetector.getDetectedTimezone).toHaveBeenCalled();
    });

    it("should work with runtime timezones", () => {
      // Set a runtime timezone
      timezoneDetector.setDefaultTimezone("America/Chicago");

      const result = inWorkingHoursNow();

      expect(typeof result).toBe("boolean");
    });
  });

  describe("formatNow", () => {
    it("should format current time for auto-detected timezone", () => {
      // Mock timezone detector to return a known timezone
      vi.spyOn(timezoneDetector, "getDetectedTimezone").mockReturnValue(
        "Europe/London"
      );

      // Mock current date
      vi.setSystemTime(new Date("2024-07-15T12:00:00.000Z"));

      const result = formatNow();

      expect(typeof result).toBe("string");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \w+$/); // YYYY-MM-DD HH:mm:ss TZ format
      expect(timezoneDetector.getDetectedTimezone).toHaveBeenCalled();
    });

    it("should work with runtime timezones", () => {
      // Set a runtime timezone
      timezoneDetector.setDefaultTimezone("America/Chicago");

      const result = formatNow();

      expect(typeof result).toBe("string");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} \w+$/);
    });
  });

  describe("Integration with timezone detection", () => {
    it("should use the same detected timezone across all functions", () => {
      // Mock timezone detector to return a consistent timezone
      const mockTimezone = "America/New_York";
      vi.spyOn(timezoneDetector, "getDetectedTimezone").mockReturnValue(
        mockTimezone
      );

      // Call all functions
      isDSTNow();
      getCurrentTimezoneParts();
      inWorkingHoursNow();
      formatNow();

      // Verify that getDetectedTimezone was called for each function
      expect(timezoneDetector.getDetectedTimezone).toHaveBeenCalledTimes(4);
    });

    it("should respect manually set default timezone", () => {
      const customTimezone = "Asia/Tokyo";
      timezoneDetector.setDefaultTimezone(customTimezone);

      // Verify that the custom timezone is used
      expect(timezoneDetector.getDetectedTimezone()).toBe(customTimezone);

      // Test that functions work with the custom timezone
      const result = formatNow();
      expect(typeof result).toBe("string");
    });
  });
});
