"""Time formatting utilities for timezone-aware string output."""

from __future__ import annotations

from datetime import datetime

from . import DEFAULT_TIMEZONE
from .timezone_registry import get_timezone_metadata, validate_platform_timezone
from .validator import validate_date, validate_timezone
from .utils import format_offset
from .dst_detector import is_dst


def to_timezone_string(date: datetime, tz: str = DEFAULT_TIMEZONE) -> str:
    """
    Format a datetime as a timezone-aware string in "YYYY-MM-DD HH:mm:ss TZ" format.

    Formats a UTC date as local time in the specified timezone with proper timezone 
    abbreviation or offset. Uses preferred timezone abbreviations when available 
    (e.g., BST, EST, EDT) and falls back to GMT offset format for timezones without 
    standard abbreviations.

    Args:
        date: The date to format (must be a valid datetime object)
        tz: IANA timezone identifier (defaults to 'Europe/London')

    Returns:
        Formatted string in "YYYY-MM-DD HH:mm:ss TZ" format

    Raises:
        ValueError: If date is invalid (NaT) or outside supported range (1970-2100)
        ValueError: If timezone is not supported or unavailable on platform

    Example:
        >>> from datetime import datetime, timezone
        >>> utc_date = datetime(2024, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
        >>> 
        >>> to_timezone_string(utc_date, 'Europe/London')       # "2024-07-15 13:00:00 BST"
        >>> to_timezone_string(utc_date, 'America/New_York')    # "2024-07-15 08:00:00 EDT"
        >>> to_timezone_string(utc_date, 'Asia/Tokyo')          # "2024-07-15 21:00:00 GMT+09:00"
        >>> 
        >>> # Winter time (standard time)
        >>> winter_date = datetime(2024, 1, 15, 12, 0, 0, tzinfo=timezone.utc)
        >>> to_timezone_string(winter_date, 'Europe/London')    # "2024-01-15 12:00:00 GMT"
        >>> to_timezone_string(winter_date, 'America/New_York') # "2024-01-15 07:00:00 EST"
    """
    validate_date(date)
    validate_timezone(tz)
    validate_platform_timezone(tz)

    # Convert to timezone-local time
    from .time_converter import to_timezone_parts
    local_parts = to_timezone_parts(date, tz)

    # Format date and time components
    date_str = f"{local_parts.year:04d}-{local_parts.month:02d}-{local_parts.day:02d}"
    time_str = f"{local_parts.hour:02d}:{local_parts.minute:02d}:{local_parts.second:02d}"

    # Determine timezone abbreviation
    tz_abbreviation = _get_timezone_abbreviation(date, tz)

    return f"{date_str} {time_str} {tz_abbreviation}"


def to_london_string(date: datetime) -> str:
    """
    Format a datetime as London local time string (convenience function).

    Args:
        date: The date to format

    Returns:
        Formatted string in "YYYY-MM-DD HH:mm:ss BST|GMT" format

    Raises:
        ValueError: If date is invalid
    """
    return to_timezone_string(date, "Europe/London")


def _get_timezone_abbreviation(date: datetime, tz: str) -> str:
    """
    Get the appropriate timezone abbreviation for a date and timezone.

    Args:
        date: The date to check
        tz: The timezone identifier

    Returns:
        Timezone abbreviation (preferred) or offset format (fallback)
    """
    metadata = get_timezone_metadata(tz)

    # For timezones without DST, use standard abbreviation or offset
    if metadata.dst_offset is None:
        if metadata.preferred_abbreviations and metadata.preferred_abbreviations.standard:
            return metadata.preferred_abbreviations.standard
        return format_offset(metadata.standard_offset)

    # Check if currently in DST
    in_dst = is_dst(date, tz)

    if in_dst:
        if metadata.preferred_abbreviations and metadata.preferred_abbreviations.dst:
            return metadata.preferred_abbreviations.dst
        return format_offset(metadata.dst_offset)
    else:
        if metadata.preferred_abbreviations and metadata.preferred_abbreviations.standard:
            return metadata.preferred_abbreviations.standard
        return format_offset(metadata.standard_offset)
