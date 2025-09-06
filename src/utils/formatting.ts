/**
 * Formatting utility functions
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
