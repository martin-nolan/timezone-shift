"""Working hours and business day utilities."""

from __future__ import annotations

from datetime import datetime

from . import DEFAULT_TIMEZONE, DEFAULT_WORKING_HOURS, DEFAULT_WORKING_DAYS
from .types import WorkingDays
from .timezone_registry import validate_platform_timezone
from .validator import validate_date, validate_timezone, validate_working_hours, validate_working_days
from .time_converter import to_timezone_parts


def in_working_hours(
    date: datetime,
    tz: str = DEFAULT_TIMEZONE,
    start: str = DEFAULT_WORKING_HOURS["start"],
    end: str = DEFAULT_WORKING_HOURS["end"],
) -> bool:
    """
    Check if a timestamp falls within working hours for a given timezone.

    Converts the input timestamp to the specified timezone's local time and checks
    if it falls within the defined working hours range. Handles timezone-aware 
    calculations correctly, including DST transitions.

    Args:
        date: The date to check (must be a valid datetime object)
        tz: IANA timezone identifier (defaults to 'Europe/London')
        start: Start time in HH:MM format (defaults to '09:00')
        end: End time in HH:MM format (defaults to '17:30')

    Returns:
        True if the timestamp is within working hours in the specified timezone

    Raises:
        ValueError: If date is invalid (NaT) or outside supported range (1970-2100)
        ValueError: If timezone is not supported or unavailable on platform
        ValueError: If time format is invalid (must be HH:MM format, e.g., '09:00')

    Example:
        >>> from datetime import datetime, timezone
        >>> utc_time = datetime(2024, 7, 15, 13, 0, 0, tzinfo=timezone.utc)  # 1 PM UTC
        >>> 
        >>> # Default working hours (09:00-17:30)
        >>> in_working_hours(utc_time, 'Europe/London')     # True (14:00 BST)
        >>> in_working_hours(utc_time, 'America/New_York')  # False (09:00 EDT, at start)
        >>> in_working_hours(utc_time, 'Asia/Tokyo')        # False (22:00 JST, after hours)
        >>> 
        >>> # Custom working hours
        >>> in_working_hours(utc_time, 'Europe/London', '08:00', '16:00')  # True
        >>> 
        >>> # Midnight-spanning hours (22:00-06:00)
        >>> night_time = datetime(2024, 7, 15, 23, 0, 0, tzinfo=timezone.utc)  # 11 PM UTC
        >>> in_working_hours(night_time, 'Europe/London', '22:00', '06:00')  # True (00:00 BST)
    """
    validate_date(date)
    validate_timezone(tz)
    validate_working_hours(start, end)
    validate_platform_timezone(tz)

    # Get timezone-local time components
    local_parts = to_timezone_parts(date, tz)

    # Parse start and end times
    start_hour, start_minute = map(int, start.split(":"))
    end_hour, end_minute = map(int, end.split(":"))

    # Convert current time to minutes since midnight
    current_minutes = local_parts.hour * 60 + local_parts.minute
    start_minutes = start_hour * 60 + start_minute
    end_minutes = end_hour * 60 + end_minute

    # Check if current time is within working hours
    if start_minutes <= end_minutes:
        # Normal case: start and end are on the same day
        return start_minutes <= current_minutes <= end_minutes
    else:
        # Edge case: working hours span midnight (e.g., 22:00 to 06:00)
        return current_minutes >= start_minutes or current_minutes <= end_minutes


def in_working_hours_london(
    date: datetime,
    start: str = DEFAULT_WORKING_HOURS["start"],
    end: str = DEFAULT_WORKING_HOURS["end"],
) -> bool:
    """
    Check if a timestamp falls within London working hours (convenience function).

    Args:
        date: The date to check
        start: Start time in HH:MM format (defaults to '09:00')
        end: End time in HH:MM format (defaults to '17:30')

    Returns:
        True if the timestamp is within London working hours

    Raises:
        ValueError: If inputs are invalid
    """
    return in_working_hours(date, "Europe/London", start, end)


def is_working_day(
    date: datetime,
    tz: str = DEFAULT_TIMEZONE,
    working_days: WorkingDays = None,
) -> bool:
    """
    Check if a date falls on a working day.

    Args:
        date: The date to check
        tz: The timezone identifier (defaults to Europe/London)
        working_days: List of working days (0=Monday, 1=Tuesday, etc.) (defaults to Monday-Friday)

    Returns:
        True if the date is a working day

    Raises:
        ValueError: If inputs are invalid
    """
    if working_days is None:
        working_days = list(DEFAULT_WORKING_DAYS)

    validate_date(date)
    validate_timezone(tz)
    validate_working_days(working_days)
    validate_platform_timezone(tz)

    # Get timezone-local date to determine the correct day of week
    local_parts = to_timezone_parts(date, tz)

    # Create a date in the local timezone to get the correct day of week
    # Note: Python's weekday() returns 0=Monday, 1=Tuesday, etc.
    from datetime import date as date_class
    local_date = date_class(
        local_parts.year, local_parts.month, local_parts.day)
    day_of_week = local_date.weekday()  # 0=Monday, 1=Tuesday, ..., 6=Sunday

    return day_of_week in working_days
