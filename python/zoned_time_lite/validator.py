"""Input validation utilities for the timezone library."""

from __future__ import annotations

from datetime import datetime
import math
from typing import Any

from .types import TimeParts


def validate_year(year: int) -> None:
    """
    Validate that a year is within the supported range.

    Args:
        year: The year to validate

    Raises:
        ValueError: If year is outside the supported range (1970-2100)
    """
    if not isinstance(year, int):
        raise ValueError(
            f"Invalid year: expected integer, got {type(year).__name__}")

    if year < 1970 or year > 2100:
        raise ValueError(
            f"Invalid year: {year}. Must be between 1970 and 2100")


def validate_timezone(timezone: str) -> None:
    """
    Validate that a timezone string is properly formatted.

    Args:
        timezone: The timezone identifier to validate

    Raises:
        ValueError: If timezone is not a valid string format
    """
    if not isinstance(timezone, str):
        raise ValueError(
            f"Invalid timezone: expected string, got {type(timezone).__name__}")

    if not timezone.strip():
        raise ValueError("Invalid timezone: empty string")

    if "/" not in timezone:
        raise ValueError(
            f"Invalid timezone format: '{timezone}'. Expected IANA format (e.g., 'Europe/London')")


def validate_date(date: datetime) -> None:
    """
    Validate that a datetime object is valid.

    Args:
        date: The datetime to validate

    Raises:
        ValueError: If date is invalid (NaT or None)
    """
    if not isinstance(date, datetime):
        raise ValueError(
            f"Invalid date: expected datetime, got {type(date).__name__}")

    if date != date:  # Check for NaT (Not a Time)
        raise ValueError("Invalid date: date is NaT")

    # Check if datetime is actually invalid by trying to get timestamp
    try:
        date.timestamp()
    except (ValueError, OverflowError) as e:
        raise ValueError(f"Invalid date: {e}")


def validate_time_parts(parts: TimeParts) -> None:
    """
    Validate time parts for basic sanity checks.

    Args:
        parts: The time parts to validate

    Raises:
        ValueError: If any time component is invalid
    """
    if not isinstance(parts, TimeParts):
        raise ValueError(
            f"Invalid time parts: expected TimeParts, got {type(parts).__name__}")

    # Validate individual components
    if not isinstance(parts.year, int) or parts.year < 1:
        raise ValueError(f"Invalid year: {parts.year}")

    if not isinstance(parts.month, int) or parts.month < 1 or parts.month > 12:
        raise ValueError(
            f"Invalid month: {parts.month}. Must be between 1 and 12")

    if not isinstance(parts.day, int) or parts.day < 1 or parts.day > 31:
        raise ValueError(f"Invalid day: {parts.day}. Must be between 1 and 31")

    if not isinstance(parts.hour, int) or parts.hour < 0 or parts.hour > 23:
        raise ValueError(
            f"Invalid hour: {parts.hour}. Must be between 0 and 23")

    if not isinstance(parts.minute, int) or parts.minute < 0 or parts.minute > 59:
        raise ValueError(
            f"Invalid minute: {parts.minute}. Must be between 0 and 59")

    if not isinstance(parts.second, int) or parts.second < 0 or parts.second > 59:
        raise ValueError(
            f"Invalid second: {parts.second}. Must be between 0 and 59")


def validate_working_hours(start: str, end: str) -> None:
    """
    Validate working hours format.

    Args:
        start: Start time in HH:MM format
        end: End time in HH:MM format

    Raises:
        ValueError: If working hours format is invalid
    """
    def validate_time_string(time_str: str, label: str) -> tuple[int, int]:
        if not isinstance(time_str, str):
            raise ValueError(
                f"Invalid {label} time: expected string, got {type(time_str).__name__}")

        if ":" not in time_str:
            raise ValueError(
                f"Invalid {label} time format: '{time_str}'. Expected HH:MM format")

        try:
            parts = time_str.split(":")
            if len(parts) != 2:
                raise ValueError(
                    f"Invalid {label} time format: '{time_str}'. Expected HH:MM format")

            hour = int(parts[0])
            minute = int(parts[1])

            if hour < 0 or hour > 23:
                raise ValueError(
                    f"Invalid {label} hour: {hour}. Must be between 0 and 23")

            if minute < 0 or minute > 59:
                raise ValueError(
                    f"Invalid {label} minute: {minute}. Must be between 0 and 59")

            return hour, minute

        except ValueError as e:
            if "invalid literal" in str(e):
                raise ValueError(
                    f"Invalid {label} time format: '{time_str}'. Expected numeric HH:MM format")
            raise

    start_hour, start_minute = validate_time_string(start, "start")
    end_hour, end_minute = validate_time_string(end, "end")

    # Convert to minutes for comparison
    start_minutes = start_hour * 60 + start_minute
    end_minutes = end_hour * 60 + end_minute

    if start_minutes >= end_minutes:
        raise ValueError(
            f"Invalid working hours: start time '{start}' must be before end time '{end}'")


def validate_working_days(days: list[int]) -> None:
    """
    Validate working days list.

    Args:
        days: List of weekday numbers (0=Monday, 1=Tuesday, ..., 6=Sunday)

    Raises:
        ValueError: If working days format is invalid
    """
    if not isinstance(days, list):
        raise ValueError(
            f"Invalid working days: expected list, got {type(days).__name__}")

    if not days:
        raise ValueError("Invalid working days: empty list")

    for day in days:
        if not isinstance(day, int):
            raise ValueError(
                f"Invalid working day: expected integer, got {type(day).__name__}")

        if day < 0 or day > 6:
            raise ValueError(
                f"Invalid working day: {day}. Must be between 0 (Monday) and 6 (Sunday)")

    # Check for duplicates
    if len(days) != len(set(days)):
        raise ValueError("Invalid working days: duplicate days found")
