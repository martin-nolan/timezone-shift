/**
 * Runtime timezone registry for dynamic timezone validation and metadata generation
 *
 * This module extends the hardcoded timezone registry to support any valid IANA timezone
 * by validating against the platform's Intl API and generating metadata dynamically.
 */

import type { TimezoneMetadata, RuntimeTimezoneMetadata } from "./types.js";
import { timezoneCache } from "./cache-manager.js";
import { validatePlatformTimezone } from "./utils/validation.js";
import { formatOffset } from "./utils/formatting.js";

/**
 * Runtime timezone registry for dynamic timezone support
 */
export class RuntimeRegistry {
  private static readonly METADATA_CACHE_PREFIX = "runtime-metadata-";
  private static readonly VALIDATION_CACHE_PREFIX = "validation-";
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Validate a timezone and register it with generated metadata
   * @param timezone - IANA timezone identifier to validate
   * @returns Runtime timezone metadata
   * @throws Error if timezone is invalid
   */
  validateAndRegister(timezone: string): RuntimeTimezoneMetadata {
    if (!timezone || typeof timezone !== "string") {
      throw new Error("Timezone must be a non-empty string");
    }

    // Check cache first
    const cacheKey = `${RuntimeRegistry.METADATA_CACHE_PREFIX}${timezone}`;
    const cached = timezoneCache.get<RuntimeTimezoneMetadata>(cacheKey);
    if (cached) {
      return cached;
    }

    // Validate against platform
    validatePlatformTimezone(timezone);

    // Generate metadata
    const metadata = this.generateMetadata(timezone);

    // Cache the result
    timezoneCache.set(cacheKey, metadata, RuntimeRegistry.CACHE_TTL);

    return metadata;
  }

  /**
   * Check if a timezone is registered (either hardcoded or runtime)
   * @param timezone - IANA timezone identifier
   * @returns True if registered
   */
  isRegistered(timezone: string): boolean {
    // Check validation cache
    const validationKey = `${RuntimeRegistry.VALIDATION_CACHE_PREFIX}${timezone}`;
    const cachedValidation = timezoneCache.get<boolean>(validationKey);
    if (cachedValidation !== null) {
      return cachedValidation;
    }

    try {
      validatePlatformTimezone(timezone);
      timezoneCache.set(validationKey, true, RuntimeRegistry.CACHE_TTL);
      return true;
    } catch {
      timezoneCache.set(validationKey, false, RuntimeRegistry.CACHE_TTL);
      return false;
    }
  }

  /**
   * Get metadata for a timezone (runtime or hardcoded)
   * @param timezone - IANA timezone identifier
   * @returns Timezone metadata
   * @throws Error if timezone is not registered
   */
  getMetadata(timezone: string): TimezoneMetadata | RuntimeTimezoneMetadata {
    // Try to get runtime metadata first
    const cacheKey = `${RuntimeRegistry.METADATA_CACHE_PREFIX}${timezone}`;
    const runtimeMetadata =
      timezoneCache.get<RuntimeTimezoneMetadata>(cacheKey);
    if (runtimeMetadata) {
      return runtimeMetadata;
    }

    // If not in runtime cache, validate and register
    if (this.isRegistered(timezone)) {
      return this.validateAndRegister(timezone);
    }

    throw new Error(`Timezone '${timezone}' is not registered or supported`);
  }

  /**
   * Get all registered timezone identifiers
   * @returns Array of timezone identifiers
   */
  getAllTimezones(): string[] {
    const hardcodedTimezones = [
      "Europe/London",
      "America/New_York",
      "America/Los_Angeles",
      "Europe/Paris",
      "Europe/Berlin",
      "Asia/Tokyo",
      "Australia/Sydney",
    ];

    // Get runtime timezones from cache
    const runtimeTimezones: string[] = [];
    const cacheKeys = timezoneCache.keys();

    for (const key of cacheKeys) {
      if (key.startsWith(RuntimeRegistry.METADATA_CACHE_PREFIX)) {
        const timezone = key.substring(
          RuntimeRegistry.METADATA_CACHE_PREFIX.length
        );
        if (!hardcodedTimezones.includes(timezone)) {
          runtimeTimezones.push(timezone);
        }
      }
    }

    return [...hardcodedTimezones, ...runtimeTimezones];
  }

  /**
   * Clear runtime registry cache
   * @param timezone - Specific timezone to clear, or undefined to clear all
   */
  clearCache(timezone?: string): void {
    if (timezone) {
      timezoneCache.clear(
        `${RuntimeRegistry.METADATA_CACHE_PREFIX}${timezone}`
      );
      timezoneCache.clear(
        `${RuntimeRegistry.VALIDATION_CACHE_PREFIX}${timezone}`
      );
    } else {
      // Clear all runtime registry entries
      const keys = timezoneCache.keys();
      for (const key of keys) {
        if (
          key.startsWith(RuntimeRegistry.METADATA_CACHE_PREFIX) ||
          key.startsWith(RuntimeRegistry.VALIDATION_CACHE_PREFIX)
        ) {
          timezoneCache.clear(key);
        }
      }
    }
  }

  /**
   * Generate metadata for a timezone by testing its behavior
   * @param timezone - IANA timezone identifier
   * @returns Generated runtime metadata
   */
  private generateMetadata(timezone: string): RuntimeTimezoneMetadata {
    const now = new Date();

    // Test with January (likely standard time) and July (likely DST if applicable)
    // Use UTC dates to avoid local timezone interference
    const januaryDate = new Date(Date.UTC(now.getFullYear(), 0, 15, 12, 0, 0));
    const julyDate = new Date(Date.UTC(now.getFullYear(), 6, 15, 12, 0, 0));

    const januaryOffset = this.getTimezoneOffset(timezone, januaryDate);
    const julyOffset = this.getTimezoneOffset(timezone, julyDate);

    // Determine standard and DST offsets
    let standardOffset: number;
    let dstOffset: number | undefined;

    if (januaryOffset === julyOffset) {
      // No DST observed
      standardOffset = januaryOffset;
      dstOffset = undefined;
    } else {
      // DST observed - standard time is typically the winter offset
      // In northern hemisphere, January is standard time
      // In southern hemisphere, July is standard time
      // We'll use the offset that appears more "standard" (closer to whole hours)
      if (Math.abs(januaryOffset % 60) <= Math.abs(julyOffset % 60)) {
        standardOffset = januaryOffset;
        dstOffset = julyOffset;
      } else {
        standardOffset = julyOffset;
        dstOffset = januaryOffset;
      }
    }

    // Generate abbreviations
    const abbreviations = this.generateAbbreviations(timezone, standardOffset);

    const metadata: RuntimeTimezoneMetadata = {
      id: timezone,
      standardOffset,
      ...(dstOffset !== undefined && { dstOffset }),
      ...(abbreviations && { preferredAbbreviations: abbreviations }),
      fallbackFormat: this.generateFallbackFormat(standardOffset),
      isRuntime: true,
      detectedAt: now,
      validatedAt: now,
    };

    return metadata;
  }

  /**
   * Get timezone offset in minutes for a specific date
   * @param timezone - IANA timezone identifier
   * @param date - Date to check offset for
   * @returns Offset in minutes from UTC
   */
  private getTimezoneOffset(timezone: string, date: Date): number {
    const utcTime = date.getTime();

    // Get local time in the timezone
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const year = parseInt(parts.find((p) => p.type === "year")?.value ?? "0");
    const month =
      parseInt(parts.find((p) => p.type === "month")?.value ?? "0") - 1;
    const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "0");
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0");
    const minute = parseInt(
      parts.find((p) => p.type === "minute")?.value ?? "0"
    );
    const second = parseInt(
      parts.find((p) => p.type === "second")?.value ?? "0"
    );

    const localTime = Date.UTC(year, month, day, hour, minute, second);

    // Calculate offset in minutes (local time - UTC time gives us the timezone offset)
    return Math.round((localTime - utcTime) / (1000 * 60));
  }

  /**
   * Generate timezone abbreviations
   * @param timezone - IANA timezone identifier
   * @param standardOffset - Standard time offset in minutes
   * @returns Abbreviations object
   */
  private generateAbbreviations(
    timezone: string,
    standardOffset: number
  ): { standard: string; dst?: string } | undefined {
    try {
      // Try to get abbreviations from Intl API
      const januaryDate = new Date(new Date().getFullYear(), 0, 15);
      const julyDate = new Date(new Date().getFullYear(), 6, 15);

      const januaryFormatter = new Intl.DateTimeFormat("en", {
        timeZone: timezone,
        timeZoneName: "short",
      });

      const julyFormatter = new Intl.DateTimeFormat("en", {
        timeZone: timezone,
        timeZoneName: "short",
      });

      const januaryParts = januaryFormatter.formatToParts(januaryDate);
      const julyParts = julyFormatter.formatToParts(julyDate);

      const januaryTz = januaryParts.find(
        (p) => p.type === "timeZoneName"
      )?.value;
      const julyTz = julyParts.find((p) => p.type === "timeZoneName")?.value;

      if (januaryTz && julyTz) {
        if (januaryTz === julyTz) {
          // No DST
          return { standard: januaryTz };
        } else {
          // Has DST - determine which is standard vs DST
          const januaryOffset = this.getTimezoneOffset(timezone, januaryDate);
          if (januaryOffset === standardOffset) {
            return { standard: januaryTz, dst: julyTz };
          } else {
            return { standard: julyTz, dst: januaryTz };
          }
        }
      }
    } catch {
      // Fall through to undefined
    }

    return undefined;
  }

  /**
   * Generate fallback format string
   * @param standardOffset - Standard time offset in minutes
   * @returns Fallback format string
   */
  private generateFallbackFormat(standardOffset: number): string {
    return formatOffset(standardOffset);
  }
}

/**
 * Global runtime registry instance
 */
export const runtimeRegistry = new RuntimeRegistry();
