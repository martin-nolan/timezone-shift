/**
 * Timezone Shift - Lightweight timezone utility with multi-timezone DST support
 *
 * This library provides timezone-aware date/time operations using platform timezone databases
 * for accurate DST handling across multiple common timezones.
 */

// Export all types
export type {
  TimeParts,
  TimezoneMetadata,
  DstTransitions,
  NextTransition,
  ClockChanges,
  NextChange,
  SupportedTimezone,
  WorkingDays,
  TimezoneDetectionResult,
  TimezoneInfo,
  CacheEntry,
  CacheStats,
  RuntimeTimezoneMetadata,
  DetectionConfig,
} from "./types.js";

// Export timezone registry utilities
export {
  getTimezoneMetadata,
  isSupportedTimezone,
  isHardcodedTimezone,
  getSupportedTimezones,
  getHardcodedTimezones,
  validateAndRegisterTimezone,
  clearRuntimeTimezoneCache,
} from "./timezone-registry.js";

// Export validation utilities
export { validatePlatformTimezone } from "./utils/validation.js";

// DST Detection functions
export { isDST, isBST } from "./dst-detector.js";

// Time formatting functions
export { toTimezoneString, toLondonString } from "./formatter.js";

// Time conversion functions
export {
  toTimezoneParts,
  toLondonParts,
  fromTimezoneParts,
  fromLondonParts,
} from "./time-converter.js";

// UTC formatting functions
export { toUTCString } from "./utc-formatter.js";

// Working hours and business day functions
export {
  inWorkingHours,
  inWorkingHoursLondon,
  isWorkingDay,
} from "./working-hours.js";

// DST transition utilities
export {
  dstTransitionDates,
  clockChangeDates,
  nextDstTransition,
  nextClockChange,
} from "./dst-transitions.js";

// Timezone detection utilities
export {
  TimezoneDetector,
  TimezoneDetectionError,
  timezoneDetector,
} from "./timezone-detector.js";

// Cache management utilities
export { CacheManager, timezoneCache } from "./cache-manager.js";

// Runtime timezone registry
export { RuntimeRegistry, runtimeRegistry } from "./runtime-registry.js";

// Auto-detection convenience functions
export {
  isDSTNow,
  getCurrentTimezoneParts,
  inWorkingHoursNow,
  formatNow,
  getDetectedTimezone,
  getTimezoneInfo,
  getTimezoneDetectionError,
} from "./auto-functions.js";

// Constants (re-exported from constants.ts to maintain backward compatibility)
export {
  DEFAULT_TIMEZONE,
  DEFAULT_WORKING_HOURS,
  DEFAULT_WORKING_DAYS,
} from "./constants.js";
