"""
Platform-based DST detection using zoneinfo APIs

This module uses Python's timezone database via zoneinfo
to detect DST status, ensuring always-current DST rules.
"""

from __future__ import annotations

from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from . import DEFAULT_TIMEZONE
from .timezone_registry import get_timezone_metadata, validate_platform_timezone
from .validator import validate_date, validate_timezone


def is_dst(date: datetime, tz: str = DEFAULT_TIMEZONE) -> bool:
    """
    Check if a date is in Daylight Saving Time for a given timezone.

    Uses platform timezone databases via zoneinfo for accurate, 
    always-current DST detection. Supports all major timezones with automatic 
    fallback to offset-based detection when abbreviations are unavailable.

    Args:
        date: The date to check (must be a valid datetime object)
        tz: IANA timezone identifier (defaults to 'Europe/London')

    Returns:
        True if the date is in DST for the specified timezone

    Raises:
        ValueError: If date is invalid (NaT) or outside supported range (1970-2100)
        ValueError: If timezone is not supported or unavailable on platform

    Example:
        >>> from datetime import datetime
        >>> summer_date = datetime(2024, 7, 15, 12, 0, 0, tzinfo=timezone.utc)
        >>> winter_date = datetime(2024, 1, 15, 12, 0, 0, tzinfo=timezone.utc)
        >>> 
        >>> is_dst(summer_date, 'Europe/London')  # True (BST)
        >>> is_dst(winter_date, 'Europe/London')  # False (GMT) 
        >>> is_dst(summer_date, 'Asia/Tokyo')     # False (no DST)
    """
    validate_date(date)
    validate_timezone(tz)

    metadata = get_timezone_metadata(tz)
    validate_platform_timezone(tz)

    # If timezone doesn't have DST, it's never in DST
    if metadata.dst_offset is None:
        return False

    # Convert to target timezone
    zone = ZoneInfo(tz)
    localized_date = date.astimezone(zone)

    # Check if DST is active using the dst() method
    dst_info = localized_date.dst()

    if dst_info is None:
        return False

    # dst() returns a timedelta - if it's non-zero, DST is active
    return dst_info.total_seconds() > 0


def is_bst(date: datetime) -> bool:
    """
    Check if a date is in British Summer Time (convenience function for Europe/London).

    This is a convenience wrapper around is_dst specifically for the Europe/London timezone.
    Returns True when London time is in British Summer Time (BST, UTC+1), False when 
    in Greenwich Mean Time (GMT, UTC+0).

    Args:
        date: The date to check (must be a valid datetime object)

    Returns:
        True if the date is in BST (British Summer Time)

    Raises:
        ValueError: If date is invalid (NaT) or outside supported range (1970-2100)

    Example:
        >>> from datetime import datetime, timezone
        >>> summer_date = datetime(2024, 7, 15, 12, 0, 0, tzinfo=timezone.utc)  # July
        >>> winter_date = datetime(2024, 1, 15, 12, 0, 0, tzinfo=timezone.utc)  # January
        >>> 
        >>> is_bst(summer_date)  # True (BST period)
        >>> is_bst(winter_date)  # False (GMT period)
        >>> 
        >>> # Equivalent to:
        >>> is_dst(summer_date, 'Europe/London')  # True
        >>> is_dst(winter_date, 'Europe/London')  # False
    """
    return is_dst(date, "Europe/London")
