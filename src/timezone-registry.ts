/**
 * Timezone metadata registry
 *
 * This registry contains minimal metadata for supported timezones.
 * Actual DST transitions are determined by platform timezone databases.
 */

import type { TimezoneMetadata, SupportedTimezone } from "./types.js";

/**
 * Registry of supported timezone metadata
 */
export const TIMEZONE_REGISTRY: Record<SupportedTimezone, TimezoneMetadata> = {
  "Europe/London": {
    id: "Europe/London",
    standardOffset: 0, // GMT is UTC+0
    dstOffset: 60, // BST is UTC+1
    preferredAbbreviations: {
      standard: "GMT",
      dst: "BST",
    },
    fallbackFormat: "GMT{offset}",
  },

  "America/New_York": {
    id: "America/New_York",
    standardOffset: -300, // EST is UTC-5
    dstOffset: -240, // EDT is UTC-4
    preferredAbbreviations: {
      standard: "EST",
      dst: "EDT",
    },
    fallbackFormat: "GMT{offset}",
  },

  "America/Los_Angeles": {
    id: "America/Los_Angeles",
    standardOffset: -480, // PST is UTC-8
    dstOffset: -420, // PDT is UTC-7
    preferredAbbreviations: {
      standard: "PST",
      dst: "PDT",
    },
    fallbackFormat: "GMT{offset}",
  },

  "Europe/Paris": {
    id: "Europe/Paris",
    standardOffset: 60, // CET is UTC+1
    dstOffset: 120, // CEST is UTC+2
    preferredAbbreviations: {
      standard: "CET",
      dst: "CEST",
    },
    fallbackFormat: "GMT{offset}",
  },

  "Europe/Berlin": {
    id: "Europe/Berlin",
    standardOffset: 60, // CET is UTC+1
    dstOffset: 120, // CEST is UTC+2
    preferredAbbreviations: {
      standard: "CET",
      dst: "CEST",
    },
    fallbackFormat: "GMT{offset}",
  },

  "Asia/Tokyo": {
    id: "Asia/Tokyo",
    standardOffset: 540, // JST is UTC+9
    // No DST in Japan
    fallbackFormat: "GMT{offset}",
  },

  "Australia/Sydney": {
    id: "Australia/Sydney",
    standardOffset: 600, // AEST is UTC+10
    dstOffset: 660, // AEDT is UTC+11
    preferredAbbreviations: {
      standard: "AEST",
      dst: "AEDT",
    },
    fallbackFormat: "GMT{offset}",
  },
};

/**
 * Get timezone metadata for a supported timezone
 * @param timezone - The timezone identifier
 * @returns Timezone metadata
 * @throws Error if timezone is not supported
 */
export function getTimezoneMetadata(timezone: string): TimezoneMetadata {
  const metadata = TIMEZONE_REGISTRY[timezone as SupportedTimezone];
  if (!metadata) {
    throw new Error(
      `Unsupported timezone: ${timezone}. Supported timezones: ${Object.keys(
        TIMEZONE_REGISTRY
      ).join(", ")}`
    );
  }
  return metadata;
}

/**
 * Check if a timezone is supported
 * @param timezone - The timezone identifier to check
 * @returns True if the timezone is supported
 */
export function isSupportedTimezone(
  timezone: string
): timezone is SupportedTimezone {
  return timezone in TIMEZONE_REGISTRY;
}

/**
 * Validate that the platform supports a timezone
 * @param timezone - The timezone identifier to validate
 * @throws Error if the timezone is not available on the platform
 */
export function validatePlatformTimezone(timezone: string): void {
  try {
    // Test if Intl.DateTimeFormat supports this timezone
    new Intl.DateTimeFormat("en", { timeZone: timezone });
  } catch (error) {
    throw new Error(
      `Timezone '${timezone}' not available on this system. ` +
        `Please ensure your system has up-to-date timezone data. ` +
        `Error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get all supported timezone identifiers
 * @returns Array of supported timezone identifiers
 */
export function getSupportedTimezones(): SupportedTimezone[] {
  return Object.keys(TIMEZONE_REGISTRY) as SupportedTimezone[];
}
