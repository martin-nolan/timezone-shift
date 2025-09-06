/**
 * Date and time utility functions
 */

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

/**
 * Get the timezone offset in minutes for a specific date and timezone
 * @param date - The date to check
 * @param timezone - The timezone identifier
 * @returns Offset in minutes from UTC (positive for east of UTC)
 */
export function getTimezoneOffset(date: Date, timezone: string): number {
  try {
    const utcTime = date.getTime();

    // Get the local time in the target timezone
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
      parseInt(parts.find((p) => p.type === "month")?.value ?? "0") - 1; // Month is 0-indexed
    const day = parseInt(parts.find((p) => p.type === "day")?.value ?? "0");
    const hour = parseInt(parts.find((p) => p.type === "hour")?.value ?? "0");
    const minute = parseInt(
      parts.find((p) => p.type === "minute")?.value ?? "0"
    );
    const second = parseInt(
      parts.find((p) => p.type === "second")?.value ?? "0"
    );

    // Create a UTC date object from the timezone-local components
    const localTime = Date.UTC(year, month, day, hour, minute, second);

    // Calculate the offset: (local time - UTC time) / (1000 * 60) = offset in minutes
    const offsetMinutes = (localTime - utcTime) / (1000 * 60);

    return Math.round(offsetMinutes);
  } catch {
    // Fallback: return 0 offset (UTC) if we can't determine the offset
    return 0;
  }
}
