"""Core type definitions for the timezone utility."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Literal, Optional, Union


@dataclass(frozen=True)
class TimeParts:
    """Represents time components in a specific timezone."""

    year: int  # Year (e.g., 2024)
    month: int  # Month (1-12)
    day: int  # Day of month (1-31)
    hour: int  # Hour (0-23)
    minute: int  # Minute (0-59)
    second: int  # Second (0-59)


@dataclass(frozen=True)
class PreferredAbbreviations:
    """Preferred timezone abbreviations."""

    standard: str  # Standard time abbreviation (e.g., 'GMT')
    dst: Optional[str] = None  # DST abbreviation (e.g., 'BST')


@dataclass(frozen=True)
class TimezoneMetadata:
    """Metadata for supported timezones."""

    id: str  # IANA timezone identifier (e.g., 'Europe/London')
    standard_offset: int  # UTC offset in minutes during standard time
    # UTC offset in minutes during DST (if applicable)
    dst_offset: Optional[int] = None
    # Preferred timezone abbreviations
    preferred_abbreviations: Optional[PreferredAbbreviations] = None
    fallback_format: str = "UTC{offset}"  # Fallback format for offset display


@dataclass(frozen=True)
class DstTransitions:
    """DST transition information."""

    dst_start_utc: datetime  # UTC timestamp when DST starts
    dst_end_utc: datetime  # UTC timestamp when DST ends


@dataclass(frozen=True)
class NextTransition:
    """Information about the next DST transition."""

    when_utc: datetime  # UTC timestamp of the transition
    type: Literal["start", "end"]  # Type of transition
    year: int  # Year of the transition


@dataclass(frozen=True)
class ClockChanges:
    """Clock change information for Europe/London (convenience type)."""

    bst_start_utc: datetime  # UTC timestamp when BST starts
    bst_end_utc: datetime  # UTC timestamp when BST ends


@dataclass(frozen=True)
class NextChange:
    """Next clock change information for Europe/London (convenience type)."""

    when_utc: datetime  # UTC timestamp of the change
    type: Literal["start", "end"]  # Type of change
    year: int  # Year of the change


# Supported timezone identifiers
SupportedTimezone = Union[
    Literal["Europe/London"],
    Literal["America/New_York"],
    Literal["America/Los_Angeles"],
    Literal["Europe/Paris"],
    Literal["Europe/Berlin"],
    Literal["Asia/Tokyo"],
    Literal["Australia/Sydney"]
]

# Working days configuration (0 = Monday, 1 = Tuesday, etc. - Python convention)
WorkingDays = list[int]
