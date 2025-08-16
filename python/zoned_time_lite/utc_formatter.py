"""UTC string formatting utilities."""

from __future__ import annotations

from datetime import datetime, timezone

from .validator import validate_date
from .utils import pad


def to_utc_string(date: datetime) -> str:
    """
    Format a datetime as a stable UTC string in "YYYY-MM-DD HH:mm:ss.SSSZ" format.

    Creates a consistently formatted UTC string with microsecond precision, suitable 
    for logging, storage, and chronological sorting. The format ensures stable 
    lexicographic ordering that matches chronological ordering.

    Args:
        date: The date to format (must be a valid datetime object)

    Returns:
        Formatted UTC string with microsecond precision

    Raises:
        ValueError: If date is invalid (NaT) or outside supported range (1970-2100)

    Example:
        >>> from datetime import datetime, timezone
        >>> date1 = datetime(2024, 7, 15, 14, 35, 42, 123000, tzinfo=timezone.utc)
        >>> date2 = datetime(2024, 7, 15, 14, 35, 42, 124000, tzinfo=timezone.utc)
        >>> 
        >>> to_utc_string(date1)  # "2024-07-15 14:35:42.123000Z"
        >>> to_utc_string(date2)  # "2024-07-15 14:35:42.124000Z"
        >>> 
        >>> # Strings sort correctly chronologically
        >>> strings = [to_utc_string(date2), to_utc_string(date1)]
        >>> strings.sort()
        >>> strings  # ["2024-07-15 14:35:42.123000Z", "2024-07-15 14:35:42.124000Z"]
        >>> 
        >>> # Handle zero-padding
        >>> early_date = datetime(2024, 1, 5, 8, 5, 5, 7000, tzinfo=timezone.utc)
        >>> to_utc_string(early_date)  # "2024-01-05 08:05:05.007000Z"
    """
    validate_date(date)

    # Convert to UTC if it has timezone info
    if date.tzinfo is not None:
        utc_date = date.astimezone(timezone.utc)
    else:
        # Assume it's already UTC if no timezone info
        utc_date = date

    year = str(utc_date.year)
    month = pad(utc_date.month, 2)
    day = pad(utc_date.day, 2)
    hour = pad(utc_date.hour, 2)
    minute = pad(utc_date.minute, 2)
    second = pad(utc_date.second, 2)
    microsecond = pad(utc_date.microsecond, 6)

    return f"{year}-{month}-{day} {hour}:{minute}:{second}.{microsecond}Z"
