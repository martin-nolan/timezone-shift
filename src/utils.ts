/**
 * Internal utility functions
 */

/**
 * Pad a number with leading zeros
 * @param num - Number to pad
 * @param length - Target length
 * @returns Padded string
 */
export function pad(num: number, length: number): string {
  return num.toString().padStart(length, "0");
}

/**
 * Format offset in minutes to GMT±HH:MM format
 * @param offsetMinutes - Offset in minutes from UTC
 * @returns Formatted offset string (e.g., 'GMT+01:00', 'GMT-05:00')
 */
export function formatOffset(offsetMinutes: number): string {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  return `GMT${sign}${pad(hours, 2)}:${pad(minutes, 2)}`;
}

/**
 * Clamp a number between min and max values
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if a year is a leap year
 * @param year - Year to check
 * @returns True if the year is a leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Get the number of days in a month
 * @param year - Year
 * @param month - Month (1-12)
 * @returns Number of days in the month
 */
export function getDaysInMonth(year: number, month: number): number {
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return daysInMonth[month - 1] ?? 30;
}
