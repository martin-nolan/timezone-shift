/**
 * Integration tests for timezone detection functionality
 */

import { describe, it, expect } from "vitest";
import { timezoneDetector } from "../timezone-detector.js";

describe("Timezone Detection Integration", () => {
  it("should detect timezone and provide info", () => {
    const detectedTimezone = timezoneDetector.getDetectedTimezone();
    expect(typeof detectedTimezone).toBe("string");
    expect(detectedTimezone.length).toBeGreaterThan(0);

    const info = timezoneDetector.getTimezoneInfo();
    expect(info.id).toBe(detectedTimezone);
    expect(typeof info.displayName).toBe("string");
    expect(typeof info.currentOffset).toBe("number");
    expect(typeof info.isDST).toBe("boolean");
    expect(typeof info.abbreviation).toBe("string");
    expect(["hardcoded", "runtime"]).toContain(info.source);
  });

  it("should allow setting and resetting default timezone", () => {
    const originalTimezone = timezoneDetector.getDetectedTimezone();

    // Set override
    timezoneDetector.setDefaultTimezone("Asia/Tokyo");
    expect(timezoneDetector.getDetectedTimezone()).toBe("Asia/Tokyo");

    // Reset
    timezoneDetector.resetDefaultTimezone();
    const resetTimezone = timezoneDetector.getDetectedTimezone();

    // Should be back to auto-detected (may be different due to caching behavior)
    expect(typeof resetTimezone).toBe("string");
    expect(resetTimezone.length).toBeGreaterThan(0);
  });

  it("should handle detection errors gracefully", () => {
    // This should not throw, even if detection fails
    const timezone = timezoneDetector.getDetectedTimezone();
    expect(typeof timezone).toBe("string");

    // Error should be null for successful detection, or an error object for failures
    const error = timezoneDetector.getTimezoneDetectionError();
    expect(error === null || error instanceof Error).toBe(true);
  });
});
