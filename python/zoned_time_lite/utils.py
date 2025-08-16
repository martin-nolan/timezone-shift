"""Internal utility functions."""

from __future__ import annotations


def pad(num: int, length: int) -> str:
    """
    Pad a number with leading zeros.

    Args:
        num: Number to pad
        length: Target length

    Returns:
        Padded string
    """
    return str(num).zfill(length)


def format_offset(offset_minutes: int) -> str:
    """
    Format offset in minutes to GMT±HH:MM format.

    Args:
        offset_minutes: Offset in minutes from UTC

    Returns:
        Formatted offset string (e.g., 'GMT+01:00', 'GMT-05:00')
    """
    sign = "+" if offset_minutes >= 0 else "-"
    abs_minutes = abs(offset_minutes)
    hours = abs_minutes // 60
    minutes = abs_minutes % 60
    return f"GMT{sign}{pad(hours, 2)}:{pad(minutes, 2)}"


def clamp(value: float, min_val: float, max_val: float) -> float:
    """
    Clamp a number between min and max values.

    Args:
        value: Value to clamp
        min_val: Minimum value  
        max_val: Maximum value

    Returns:
        Clamped value
    """
    return min(max(value, min_val), max_val)


def is_leap_year(year: int) -> bool:
    """
    Check if a year is a leap year.

    Args:
        year: Year to check

    Returns:
        True if the year is a leap year
    """
    return (year % 4 == 0 and year % 100 != 0) or year % 400 == 0


def get_days_in_month(year: int, month: int) -> int:
    """
    Get the number of days in a month.

    Args:
        year: Year
        month: Month (1-12)

    Returns:
        Number of days in the month
    """
    days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

    if month == 2 and is_leap_year(year):
        return 29

    if 1 <= month <= 12:
        return days_in_month[month - 1]

    return 30  # fallback
