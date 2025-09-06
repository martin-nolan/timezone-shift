/**
 * Timezone metadata registry
 *
 * This registry contains minimal metadata for supported timezones.
 * Actual DST transitions are determined by platform timezone databases.
 */

import type {
  TimezoneMetadata,
  SupportedTimezone,
  RuntimeTimezoneMetadata,
} from "./types.js";
import { runtimeRegistry } from "./runtime-registry.js";

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
export function getTimezoneMetadata(
  timezone: string
): TimezoneMetadata | RuntimeTimezoneMetadata {
  // First check hardcoded registry
  const hardcodedMetadata = TIMEZONE_REGISTRY[timezone as SupportedTimezone];
  if (hardcodedMetadata) {
    return hardcodedMetadata;
  }

  // If not in hardcoded registry, try runtime registry
  try {
    return runtimeRegistry.getMetadata(timezone);
  } catch {
    throw new Error(
      `Unsupported timezone: ${timezone}. Supported timezones: ${getSupportedTimezones().join(
        ", "
      )}`
    );
  }
}

/**
 * Check if a timezone is supported
 * @param timezone - The timezone identifier to check
 * @returns True if the timezone is supported
 */
export function isSupportedTimezone(timezone: string): boolean {
  // Check hardcoded registry first
  if (timezone in TIMEZONE_REGISTRY) {
    return true;
  }

  // Check runtime registry
  return runtimeRegistry.isRegistered(timezone);
}

/**
 * Check if a timezone is in the hardcoded registry
 * @param timezone - The timezone identifier to check
 * @returns True if the timezone is in the hardcoded registry
 */
export function isHardcodedTimezone(
  timezone: string
): timezone is SupportedTimezone {
  return timezone in TIMEZONE_REGISTRY;
}

/**
 * Validate that the platform supports a timezone
/**
 * Get all supported timezone identifiers
 * @returns Array of supported timezone identifiers
 */
export function getSupportedTimezones(): string[] {
  return runtimeRegistry.getAllTimezones();
}

/**
 * Get only hardcoded timezone identifiers
 * @returns Array of hardcoded timezone identifiers
 */
export function getHardcodedTimezones(): SupportedTimezone[] {
  return Object.keys(TIMEZONE_REGISTRY) as SupportedTimezone[];
}

/**
 * Validate and register a timezone for runtime use
 * @param timezone - The timezone identifier to validate and register
 * @returns Runtime timezone metadata
 * @throws Error if timezone is invalid
 */
export function validateAndRegisterTimezone(
  timezone: string
): RuntimeTimezoneMetadata {
  return runtimeRegistry.validateAndRegister(timezone);
}

/**
 * Clear runtime timezone cache
 * @param timezone - Specific timezone to clear, or undefined to clear all runtime timezones
 */
export function clearRuntimeTimezoneCache(timezone?: string): void {
  runtimeRegistry.clearCache(timezone);
}
