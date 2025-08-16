"""Time conversion utilities for timezone-aware operations."""

from __future__ import annotations

from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo

from . import DEFAULT_TIMEZONE
from .types import TimeParts
from .timezone_registry import get_timezone_metadata, validate_platform_timezone
from .validator import validate_date, validate_timezone, validate_time_parts


def to_timezone_parts(date: datetime, tz: str = DEFAULT_TIMEZONE) -> TimeParts:
    """
    Extract timezone-local time components from a UTC datetime.

    Converts a UTC datetime object into timezone-local time components, accounting for 
    DST transitions and timezone offsets. The returned TimeParts represent the local 
    time as it would appear on a clock in the specified timezone.

    Args:
        date: The UTC date to convert (must be a valid datetime object)
        tz: IANA timezone identifier (defaults to 'Europe/London')

    Returns:
        TimeParts object with local time components

    Raises:
        ValueError: If date is invalid (NaT) or outside supported range (1970-2100)
        ValueError: If timezone is not supported or unavailable on platform

    Example:
        >>> from datetime import datetime, timezone
        >>> utc_date = datetime(2024, 7, 15, 12, 0, 0, tzinfo=timezone.utc)  # UTC noon
        >>> 
        >>> london_parts = to_timezone_parts(utc_date, 'Europe/London')
        >>> london_parts  # TimeParts(year=2024, month=7, day=15, hour=13, minute=0, second=0) (BST)
        >>> 
        >>> new_york_parts = to_timezone_parts(utc_date, 'America/New_York') 
        >>> new_york_parts  # TimeParts(year=2024, month=7, day=15, hour=8, minute=0, second=0) (EDT)
        >>> 
        >>> tokyo_parts = to_timezone_parts(utc_date, 'Asia/Tokyo')
        >>> tokyo_parts  # TimeParts(year=2024, month=7, day=15, hour=21, minute=0, second=0) (JST)
    """
    validate_date(date)
    validate_timezone(tz)
    validate_platform_timezone(tz)

    # Convert to target timezone
    zone = ZoneInfo(tz)
    local_date = date.astimezone(zone)

    return TimeParts(
        year=local_date.year,
        month=local_date.month,
        day=local_date.day,
        hour=local_date.hour,
        minute=local_date.minute,
        second=local_date.second,
    )


def to_london_parts(date: datetime) -> TimeParts:
    """
    Extract London local time components from a UTC datetime (convenience function).

    Convenience wrapper around to_timezone_parts specifically for Europe/London timezone.
    Automatically handles GMT/BST transitions.

    Args:
        date: The UTC date to convert (must be a valid datetime object)

    Returns:
        TimeParts object with London local time components

    Raises:
        ValueError: If date is invalid (NaT) or outside supported range (1970-2100)

    Example:
        >>> from datetime import datetime, timezone
        >>> utc_date = datetime(2024, 7, 15, 12, 0, 0, tzinfo=timezone.utc)  # UTC noon in summer
        >>> london_parts = to_london_parts(utc_date)
        >>> london_parts  # TimeParts(year=2024, month=7, day=15, hour=13, minute=0, second=0) (BST)
        >>> 
        >>> winter_date = datetime(2024, 1, 15, 12, 0, 0, tzinfo=timezone.utc)  # UTC noon in winter
        >>> winter_parts = to_london_parts(winter_date)
        >>> winter_parts  # TimeParts(year=2024, month=1, day=15, hour=12, minute=0, second=0) (GMT)
    """
    return to_timezone_parts(date, "Europe/London")


def from_timezone_parts(parts: TimeParts, tz: str = DEFAULT_TIMEZONE) -> datetime:
    """
    Create a UTC datetime from timezone-local time components.

    Converts timezone-local time parts into a UTC datetime object, properly handling 
    DST edge cases. Uses Python's zoneinfo for accurate resolution.

    **DST Edge Case Handling:**
    - **Spring forward gaps**: Non-existent times are advanced to the first valid time  
    - **Autumn fallback duplicates**: Ambiguous times resolve to first occurrence (DST time)

    Args:
        parts: The local time components in the specified timezone
        tz: IANA timezone identifier (defaults to 'Europe/London')

    Returns:
        UTC datetime object

    Raises:
        ValueError: If time parts are invalid (e.g., month 13, hour 25)
        ValueError: If timezone is not supported or unavailable on platform

    Example:
        >>> from datetime import datetime
        >>> # Normal case
        >>> normal_parts = TimeParts(year=2024, month=7, day=15, hour=14, minute=30, second=0)
        >>> utc_date = from_timezone_parts(normal_parts, 'Europe/London')
        >>> utc_date.isoformat()  # "2024-07-15T13:30:00+00:00" (BST-1)
        >>> 
        >>> # Spring forward gap (01:30 doesn't exist in London on March 31, 2024)
        >>> gap_parts = TimeParts(year=2024, month=3, day=31, hour=1, minute=30, second=0)
        >>> resolved_gap = from_timezone_parts(gap_parts, 'Europe/London')
        >>> resolved_local = to_timezone_parts(resolved_gap, 'Europe/London')
        >>> resolved_local.hour  # 2 (or later) - advanced to valid time
        >>> 
        >>> # Autumn fallback duplicate (01:30 occurs twice on October 27, 2024)  
        >>> duplicate_parts = TimeParts(year=2024, month=10, day=27, hour=1, minute=30, second=0)
        >>> resolved_dup = from_timezone_parts(duplicate_parts, 'Europe/London') 
        >>> # First occurrence (DST time) is returned
    """
    validate_time_parts(parts)
    validate_timezone(tz)
    validate_platform_timezone(tz)

    try:
        # Create a naive datetime from the parts
        naive_dt = datetime(
            parts.year,
            parts.month,
            parts.day,
            parts.hour,
            parts.minute,
            parts.second
        )

        # Localize to the target timezone
        zone = ZoneInfo(tz)

        # Try to localize the datetime - this handles DST edge cases
        try:
            # The fold parameter handles ambiguous times (autumn fallback)
            # fold=0 means first occurrence (DST time), fold=1 means second occurrence (standard time)
            local_dt = naive_dt.replace(tzinfo=zone)

            # Convert to UTC
            utc_dt = local_dt.astimezone(timezone.utc)
            return utc_dt

        except Exception:
            # Handle non-existent times (spring forward gaps)
            # Python's zoneinfo handles this by advancing to the next valid time
            try:
                # Try with fold=1 (second occurrence for ambiguous times)
                local_dt = naive_dt.replace(tzinfo=zone, fold=1)
                utc_dt = local_dt.astimezone(timezone.utc)
                return utc_dt
            except Exception:
                # If that fails, try to find the next valid time
                for delta_minutes in range(1, 181):  # Search up to 3 hours ahead
                    try:
                        adjusted_dt = naive_dt + \
                            timedelta(minutes=delta_minutes)
                        local_dt = adjusted_dt.replace(tzinfo=zone)
                        utc_dt = local_dt.astimezone(timezone.utc)
                        return utc_dt
                    except Exception:
                        continue

                # Last resort: try the previous valid time
                for delta_minutes in range(1, 181):
                    try:
                        adjusted_dt = naive_dt - \
                            timedelta(minutes=delta_minutes)
                        local_dt = adjusted_dt.replace(tzinfo=zone)
                        utc_dt = local_dt.astimezone(timezone.utc)
                        return utc_dt
                    except Exception:
                        continue

                raise ValueError(
                    f"Cannot resolve time parts for {tz}: {parts}. "
                    f"This may be a non-existent time during DST transition."
                )

    except ValueError as e:
        if "time parts" in str(e).lower():
            raise
        raise ValueError(f"Invalid time parts: {e}")


def from_london_parts(parts: TimeParts) -> datetime:
    """
    Create a UTC datetime from London local time components (convenience function).

    Args:
        parts: The London local time components

    Returns:
        UTC datetime object

    Raises:
        ValueError: If parts are invalid or cannot be resolved
    """
    return from_timezone_parts(parts, "Europe/London")
