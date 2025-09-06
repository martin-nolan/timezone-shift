/**
 * Core type definitions for the timezone utility
 */

/**
 * Represents time components in a specific timezone
 */
export interface TimeParts {
  /** Year (e.g., 2024) */
  year: number;
  /** Month (1-12) */
  month: number;
  /** Day of month (1-31) */
  day: number;
  /** Hour (0-23) */
  hour: number;
  /** Minute (0-59) */
  minute: number;
  /** Second (0-59) */
  second: number;
}

/**
 * Metadata for supported timezones
 */
export interface TimezoneMetadata {
  /** IANA timezone identifier (e.g., 'Europe/London') */
  id: string;
  /** UTC offset in minutes during standard time */
  standardOffset: number;
  /** UTC offset in minutes during DST (if applicable) */
  dstOffset?: number;
  /** Preferred timezone abbreviations */
  preferredAbbreviations?: {
    /** Standard time abbreviation (e.g., 'GMT') */
    standard: string;
    /** DST abbreviation (e.g., 'BST') */
    dst?: string;
  };
  /** Fallback format for offset display (e.g., 'GMT{offset}') */
  fallbackFormat: string;
}

/**
 * DST transition information
 */
export interface DstTransitions {
  /** UTC timestamp when DST starts */
  dstStartUtc: Date;
  /** UTC timestamp when DST ends */
  dstEndUtc: Date;
}

/**
 * Information about the next DST transition
 */
export interface NextTransition {
  /** UTC timestamp of the transition */
  whenUtc: Date;
  /** Type of transition */
  type: "start" | "end";
  /** Year of the transition */
  year: number;
}

/**
 * Clock change information for Europe/London (convenience type)
 */
export interface ClockChanges {
  /** UTC timestamp when BST starts */
  bstStartUtc: Date;
  /** UTC timestamp when BST ends */
  bstEndUtc: Date;
}

/**
 * Next clock change information for Europe/London (convenience type)
 */
export interface NextChange {
  /** UTC timestamp of the change */
  whenUtc: Date;
  /** Type of change */
  type: "start" | "end";
  /** Year of the change */
  year: number;
}

/**
 * Supported timezone identifiers
 */
export type SupportedTimezone =
  | "Europe/London"
  | "America/New_York"
  | "America/Los_Angeles"
  | "Europe/Paris"
  | "Europe/Berlin"
  | "Asia/Tokyo"
  | "Australia/Sydney";

/**
 * Working days configuration (0 = Sunday, 1 = Monday, etc.)
 */
export type WorkingDays = number[];

/**
 * Result of timezone detection with metadata
 */
export interface TimezoneDetectionResult {
  /** Detected timezone identifier */
  timezone: string;
  /** Source of the detection */
  source: "browser" | "node" | "env" | "fallback";
  /** Confidence level of the detection */
  confidence: "high" | "medium" | "low";
}

/**
 * Information about the current timezone
 */
export interface TimezoneInfo {
  /** IANA timezone identifier */
  id: string;
  /** Human-readable display name */
  displayName: string;
  /** Current UTC offset in minutes */
  currentOffset: number;
  /** Whether currently in DST */
  isDST: boolean;
  /** Current timezone abbreviation */
  abbreviation: string;
  /** Source of timezone metadata */
  source: "hardcoded" | "runtime";
}

/**
 * Cache entry with timestamp and optional TTL
 */
export interface CacheEntry<T> {
  /** Cached value */
  value: T;
  /** Timestamp when cached */
  timestamp: Date;
  /** Time-to-live in milliseconds (optional) */
  ttl?: number;
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  /** Total number of entries */
  totalEntries: number;
  /** Number of active (non-expired) entries */
  activeEntries: number;
  /** Number of expired entries */
  expiredEntries: number;
  /** Cache hit rate as percentage */
  hitRate: number;
}

/**
 * Extended timezone metadata for runtime-discovered timezones
 */
export interface RuntimeTimezoneMetadata extends TimezoneMetadata {
  /** Indicates this is a runtime-discovered timezone */
  isRuntime: true;
  /** When this timezone was first detected */
  detectedAt: Date;
  /** When this timezone was last validated */
  validatedAt: Date;
}

/**
 * Configuration options for timezone detection
 */
export interface DetectionConfig {
  /** Fallback timezone to use if detection fails */
  fallbackTimezone?: string;
  /** Whether to enable caching of detection results */
  enableCaching?: boolean;
  /** Preferred detection source in environments that support multiple methods */
  preferredSource?: "browser" | "node" | "env";
}

/**
 * Custom error for timezone detection failures
 */
export class TimezoneDetectionError extends Error {
  constructor(
    message: string,
    public readonly source: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = "TimezoneDetectionError";
  }
}
