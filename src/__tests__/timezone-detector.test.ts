/**
 * Tests for timezone detection functionality
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  TimezoneDetector,
  TimezoneDetectionError,
} from "../timezone-detector.js";

describe("TimezoneDetector", () => {
  let detector: TimezoneDetector;

  beforeEach(() => {
    detector = new TimezoneDetector();
    // Clear any cached state
    detector.resetDefaultTimezone();
  });

  describe("detectTimezone", () => {
    it("should detect timezone in browser environment", () => {
      // Mock browser environment
      vi.stubGlobal("window", {});
      vi.stubGlobal("document", {});

      // Mock Intl.DateTimeFormat
      const mockResolvedOptions = vi.fn().mockReturnValue({
        timeZone: "America/New_York",
      });
      vi.stubGlobal("Intl", {
        DateTimeFormat: vi.fn().mockImplementation(() => ({
          resolvedOptions: mockResolvedOptions,
          formatToParts: vi.fn().mockReturnValue([
            { type: "year", value: "2024" },
            { type: "month", value: "01" },
            { type: "day", value: "01" },
            { type: "hour", value: "12" },
            { type: "minute", value: "00" },
            { type: "second", value: "00" },
          ]),
        })),
      });

      const result = detector.detectTimezone();

      expect(result.timezone).toBe("America/New_York");
      expect(result.source).toBe("browser");
      expect(result.confidence).toBe("high");
    });

    it("should fallback to default timezone on detection failure", () => {
      // Mock browser environment
      vi.stubGlobal("window", {});
      vi.stubGlobal("document", {});

      // Mock Intl.DateTimeFormat to throw error
      vi.stubGlobal("Intl", {
        DateTimeFormat: vi.fn().mockImplementation(() => {
          throw new Error("Detection failed");
        }),
      });

      const result = detector.detectTimezone();

      expect(result.timezone).toBe("Europe/London"); // Browser fallback
      expect(result.source).toBe("fallback");
      expect(result.confidence).toBe("low");
    });
  });

  describe("setDefaultTimezone", () => {
    it("should set and use override timezone", () => {
      // Mock Intl for validation
      vi.stubGlobal("Intl", {
        DateTimeFormat: vi.fn().mockImplementation(() => ({
          formatToParts: vi.fn().mockReturnValue([
            { type: "year", value: "2024" },
            { type: "month", value: "01" },
            { type: "day", value: "01" },
            { type: "hour", value: "12" },
            { type: "minute", value: "00" },
            { type: "second", value: "00" },
          ]),
        })),
      });

      detector.setDefaultTimezone("Asia/Tokyo");
      const result = detector.detectTimezone();

      expect(result.timezone).toBe("Asia/Tokyo");
      expect(result.source).toBe("fallback");
      expect(result.confidence).toBe("high");
    });

    it("should throw error for invalid timezone", () => {
      // Mock Intl to throw error for invalid timezone
      vi.stubGlobal("Intl", {
        DateTimeFormat: vi.fn().mockImplementation(() => {
          throw new Error("Invalid timezone");
        }),
      });

      expect(() => {
        detector.setDefaultTimezone("Invalid/Timezone");
      }).toThrow(TimezoneDetectionError);
    });
  });

  describe("resetDefaultTimezone", () => {
    it("should reset to auto-detection", () => {
      // Mock browser environment
      vi.stubGlobal("window", {});
      vi.stubGlobal("document", {});

      const mockResolvedOptions = vi.fn().mockReturnValue({
        timeZone: "America/New_York",
      });
      vi.stubGlobal("Intl", {
        DateTimeFormat: vi.fn().mockImplementation(() => ({
          resolvedOptions: mockResolvedOptions,
          formatToParts: vi.fn().mockReturnValue([
            { type: "year", value: "2024" },
            { type: "month", value: "01" },
            { type: "day", value: "01" },
            { type: "hour", value: "12" },
            { type: "minute", value: "00" },
            { type: "second", value: "00" },
          ]),
        })),
      });

      // Set override
      detector.setDefaultTimezone("Asia/Tokyo");
      expect(detector.getDetectedTimezone()).toBe("Asia/Tokyo");

      // Reset
      detector.resetDefaultTimezone();
      const result = detector.detectTimezone();

      expect(result.timezone).toBe("America/New_York");
      expect(result.source).toBe("browser");
    });
  });

  describe("getTimezoneInfo", () => {
    it("should return timezone information", () => {
      // Mock browser environment
      vi.stubGlobal("window", {});
      vi.stubGlobal("document", {});

      vi.stubGlobal("Intl", {
        DateTimeFormat: vi.fn().mockImplementation((locale, options) => ({
          resolvedOptions: vi.fn().mockReturnValue({
            timeZone: "Europe/London",
          }),
          formatToParts: vi.fn().mockReturnValue([
            { type: "year", value: "2024" },
            { type: "month", value: "07" },
            { type: "day", value: "15" },
            { type: "hour", value: "13" }, // BST
            { type: "minute", value: "00" },
            { type: "second", value: "00" },
            ...(options?.timeZoneName
              ? [{ type: "timeZoneName", value: "BST" }]
              : []),
          ]),
        })),
      });

      const info = detector.getTimezoneInfo();

      expect(info.id).toBe("Europe/London");
      expect(info.displayName).toBe("London");
      expect(["GMT", "BST"]).toContain(info.abbreviation);
      expect(info.source).toBe("hardcoded");
      expect(typeof info.currentOffset).toBe("number");
      expect(typeof info.isDST).toBe("boolean");
    });
  });
});
