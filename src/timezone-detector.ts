/**
 * Timezone detection and management
 *
 * This module provides automatic timezone detection for browser and Node.js environments
 * with fallback mechanisms and caching support.
 */

import {
  isHardcodedTimezone,
  getTimezoneMetadata,
} from "./timezone-registry.js";
import { validatePlatformTimezone } from "./utils/validation.js";
import { timezoneCache } from "./cache-manager.js";
import { formatOffset } from "./utils/formatting.js";
import { getTimezoneOffset } from "./utils/date-utils.js";

import type { TimezoneDetectionResult, TimezoneInfo } from "./types.js";
import { TimezoneDetectionError } from "./types.js";

// Re-export for backward compatibility
export { TimezoneDetectionError };

/**
 * Timezone detection and management class
 */
export class TimezoneDetector {
  private static readonly DETECTION_CACHE_KEY = "timezone-detection-result";
  private static readonly TIMEZONE_INFO_CACHE_PREFIX = "timezone-info-";
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  private overrideTimezone: string | null = null;
  private lastDetectionError: TimezoneDetectionError | null = null;

  /**
   * Detect the current timezone using platform-specific methods
   * @returns Detection result with timezone and metadata
   */
  detectTimezone(): TimezoneDetectionResult {
    // If we have an override set, use it
    if (this.overrideTimezone) {
      return {
        timezone: this.overrideTimezone,
        source: "fallback",
        confidence: "high",
      };
    }

    // Return cached result if available
    const cachedResult = timezoneCache.get<TimezoneDetectionResult>(
      TimezoneDetector.DETECTION_CACHE_KEY
    );
    if (cachedResult) {
      return cachedResult;
    }

    try {
      let result: TimezoneDetectionResult;

      // Detect based on environment
      if (this.isBrowserEnvironment()) {
        result = this.detectBrowserTimezone();
      } else {
        result = this.detectNodeTimezone();
      }

      // Validate the detected timezone
      this.validateDetectedTimezone(result.timezone);

      // Cache the successful result
      timezoneCache.set(
        TimezoneDetector.DETECTION_CACHE_KEY,
        result,
        TimezoneDetector.CACHE_TTL
      );
      this.lastDetectionError = null;

      return result;
    } catch (error) {
      const detectionError = new TimezoneDetectionError(
        `Timezone detection failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        this.isBrowserEnvironment() ? "browser" : "node",
        error instanceof Error ? error : undefined
      );

      this.lastDetectionError = detectionError;

      // Return fallback timezone
      const fallbackTimezone = this.isBrowserEnvironment()
        ? "Europe/London"
        : "UTC";
      const fallbackResult: TimezoneDetectionResult = {
        timezone: fallbackTimezone,
        source: "fallback",
        confidence: "low",
      };

      timezoneCache.set(
        TimezoneDetector.DETECTION_CACHE_KEY,
        fallbackResult,
        TimezoneDetector.CACHE_TTL
      );

      return fallbackResult;
    }
  }

  /**
   * Set a default timezone, overriding auto-detection
   * @param timezone - IANA timezone identifier
   * @throws TimezoneDetectionError if timezone is invalid
   */
  setDefaultTimezone(timezone: string): void {
    try {
      this.validateDetectedTimezone(timezone);
      this.overrideTimezone = timezone;
      this.clearCache();
    } catch (error) {
      throw new TimezoneDetectionError(
        `Invalid default timezone: ${timezone}`,
        "override",
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Reset to auto-detection behavior
   */
  resetDefaultTimezone(): void {
    this.overrideTimezone = null;
    this.clearCache();
  }

  /**
   * Get the currently detected or configured timezone
   * @returns IANA timezone identifier
   */
  getDetectedTimezone(): string {
    const result = this.detectTimezone();
    return result.timezone;
  }

  /**
   * Get detailed information about the current timezone
   * @returns Timezone information object
   */
  getTimezoneInfo(): TimezoneInfo {
    const timezone = this.getDetectedTimezone();
    const cacheKey = `${TimezoneDetector.TIMEZONE_INFO_CACHE_PREFIX}${timezone}`;

    // Check cache first (with shorter TTL since timezone info can change with DST)
    const cached = timezoneCache.get<TimezoneInfo>(cacheKey);
    if (cached) {
      return cached;
    }

    const now = new Date();

    // Get current offset using Intl API
    const currentOffset = getTimezoneOffset(now, timezone);

    // Get timezone abbreviation - try to use registry metadata first
    let abbreviation: string;
    try {
      const metadata = getTimezoneMetadata(timezone);
      if (metadata.preferredAbbreviations) {
        const isDST = this.isCurrentlyDST(timezone, now);
        abbreviation =
          isDST && metadata.preferredAbbreviations.dst
            ? metadata.preferredAbbreviations.dst
            : metadata.preferredAbbreviations.standard;
      } else {
        abbreviation = this.getTimezoneAbbreviation(timezone, now);
      }
    } catch {
      abbreviation = this.getTimezoneAbbreviation(timezone, now);
    }

    // Check if currently in DST
    const isDST = this.isCurrentlyDST(timezone, now);

    const info: TimezoneInfo = {
      id: timezone,
      displayName: this.getDisplayName(timezone),
      currentOffset,
      isDST,
      abbreviation,
      source: this.isHardcodedTimezone(timezone) ? "hardcoded" : "runtime",
    };

    // Cache with shorter TTL (1 hour) since DST status can change
    timezoneCache.set(cacheKey, info, 60 * 60 * 1000);

    return info;
  }

  /**
   * Get the last detection error, if any
   * @returns Last detection error or null
   */
  getTimezoneDetectionError(): TimezoneDetectionError | null {
    return this.lastDetectionError;
  }

  /**
   * Clear the detection cache
   */
  private clearCache(): void {
    timezoneCache.clear(TimezoneDetector.DETECTION_CACHE_KEY);
    // Also clear any timezone info cache entries
    const keys = timezoneCache.keys();
    for (const key of keys) {
      if (key.startsWith(TimezoneDetector.TIMEZONE_INFO_CACHE_PREFIX)) {
        timezoneCache.clear(key);
      }
    }
  }

  /**
   * Detect if running in browser environment
   * @returns True if in browser
   */
  private isBrowserEnvironment(): boolean {
    return typeof window !== "undefined" && typeof document !== "undefined";
  }

  /**
   * Detect timezone in browser environment
   * @returns Detection result
   */
  private detectBrowserTimezone(): TimezoneDetectionResult {
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (!timezone) {
        throw new Error("Browser timezone detection returned empty result");
      }

      return {
        timezone,
        source: "browser",
        confidence: "high",
      };
    } catch (error) {
      throw new TimezoneDetectionError(
        "Failed to detect browser timezone",
        "browser",
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Detect timezone in Node.js environment
   * @returns Detection result
   */
  private detectNodeTimezone(): TimezoneDetectionResult {
    // Try process.env.TZ first
    if (process.env.TZ) {
      try {
        // Validate the TZ environment variable
        this.validateDetectedTimezone(process.env.TZ);
        return {
          timezone: process.env.TZ,
          source: "env",
          confidence: "high",
        };
      } catch {
        // TZ env var is invalid, continue to next method
      }
    }

    // Try Intl API
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (!timezone) {
        throw new Error("Node.js timezone detection returned empty result");
      }

      return {
        timezone,
        source: "node",
        confidence: "medium",
      };
    } catch (error) {
      throw new TimezoneDetectionError(
        "Failed to detect Node.js timezone",
        "node",
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Validate a detected timezone against platform support
   * @param timezone - Timezone to validate
   * @throws Error if timezone is invalid
   */
  private validateDetectedTimezone(timezone: string): void {
    if (!timezone || typeof timezone !== "string") {
      throw new Error("Timezone must be a non-empty string");
    }

    // Use existing platform validation
    validatePlatformTimezone(timezone);
  }

  /**
   * Get timezone abbreviation for current time
   * @param timezone - IANA timezone identifier
   * @param date - Date to get abbreviation for
   * @returns Timezone abbreviation
   */
  private getTimezoneAbbreviation(timezone: string, date: Date): string {
    try {
      const formatter = new Intl.DateTimeFormat("en", {
        timeZone: timezone,
        timeZoneName: "short",
      });

      const parts = formatter.formatToParts(date);
      const timeZoneName = parts.find(
        (part) => part.type === "timeZoneName"
      )?.value;

      return (
        timeZoneName ?? `UTC${formatOffset(getTimezoneOffset(date, timezone))}`
      );
    } catch {
      return `UTC${formatOffset(getTimezoneOffset(date, timezone))}`;
    }
  }

  /**
   * Check if currently in DST
   * @param timezone - IANA timezone identifier
   * @param date - Date to check
   * @returns True if in DST
   */
  private isCurrentlyDST(timezone: string, date: Date): boolean {
    try {
      const metadata = getTimezoneMetadata(timezone);

      // If timezone doesn't have DST, return false
      if (!metadata.dstOffset) {
        return false;
      }

      // Compare current offset with standard and DST offsets
      const currentOffset = getTimezoneOffset(date, timezone);

      // If current offset matches DST offset, we're in DST
      if (currentOffset === metadata.dstOffset) {
        return true;
      }

      // If current offset matches standard offset, we're not in DST
      if (currentOffset === metadata.standardOffset) {
        return false;
      }

      // If neither matches exactly, fall back to comparison logic
      return currentOffset > metadata.standardOffset;
    } catch {
      // Fallback to simple DST check: compare current offset with January offset
      const currentOffset = getTimezoneOffset(date, timezone);
      const januaryOffset = getTimezoneOffset(
        new Date(date.getFullYear(), 0, 1),
        timezone
      );

      // If current offset is greater than January offset, likely in DST
      return currentOffset > januaryOffset;
    }
  }

  /**
   * Get display name for timezone
   * @param timezone - IANA timezone identifier
   * @returns Human-readable display name
   */
  private getDisplayName(timezone: string): string {
    try {
      // Extract region from timezone (e.g., "Europe/London" -> "London")
      const parts = timezone.split("/");
      if (parts.length > 1) {
        const region = parts[parts.length - 1]?.replace(/_/g, " ");
        return region ?? timezone;
      }

      // Fallback: format timezone name
      return timezone.replace(/_/g, " ");
    } catch {
      return timezone;
    }
  }

  /**
   * Check if timezone is in hardcoded registry
   * @param timezone - IANA timezone identifier
   * @returns True if hardcoded
   */
  private isHardcodedTimezone(timezone: string): boolean {
    return isHardcodedTimezone(timezone);
  }
}

/**
 * Global timezone detector instance
 */
export const timezoneDetector = new TimezoneDetector();
