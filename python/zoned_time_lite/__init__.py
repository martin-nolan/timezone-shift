"""
Zoned Time Lite - Lightweight timezone utility with multi-timezone DST support

This library provides timezone-aware date/time operations using platform timezone databases
for accurate DST handling across multiple common timezones.
"""

from __future__ import annotations

# Export all types
from .types import (
    TimeParts,
    TimezoneMetadata,
    PreferredAbbreviations,
    DstTransitions,
    NextTransition,
    ClockChanges,
    NextChange,
    SupportedTimezone,
    WorkingDays,
)

# Export timezone registry utilities
from .timezone_registry import (
    get_timezone_metadata,
    is_supported_timezone,
    validate_platform_timezone,
    get_supported_timezones,
)

# DST Detection functions
from .dst_detector import is_dst, is_bst

# Time formatting functions
from .formatter import to_timezone_string, to_london_string

# Time conversion functions
from .time_converter import (
    to_timezone_parts,
    to_london_parts,
    from_timezone_parts,
    from_london_parts,
)

# UTC formatting functions
from .utc_formatter import to_utc_string

# Working hours and business day functions
from .working_hours import (
    in_working_hours,
    in_working_hours_london,
    is_working_day,
)

# DST transition utilities
from .dst_transitions import (
    dst_transition_dates,
    clock_change_dates,
    next_dst_transition,
    next_clock_change,
)

# Constants
DEFAULT_TIMEZONE = "Europe/London"
DEFAULT_WORKING_HOURS = {"start": "09:00", "end": "17:30"}
# Monday-Friday (Python convention: 0=Monday)
DEFAULT_WORKING_DAYS = [0, 1, 2, 3, 4]

__version__ = "1.0.0"
__all__ = [
    # Types
    "TimeParts",
    "TimezoneMetadata",
    "PreferredAbbreviations",
    "DstTransitions",
    "NextTransition",
    "ClockChanges",
    "NextChange",
    "SupportedTimezone",
    "WorkingDays",
    # Timezone registry
    "get_timezone_metadata",
    "is_supported_timezone",
    "validate_platform_timezone",
    "get_supported_timezones",
    # DST detection
    "is_dst",
    "is_bst",
    # Time formatting
    "to_timezone_string",
    "to_london_string",
    # Time conversion
    "to_timezone_parts",
    "to_london_parts",
    "from_timezone_parts",
    "from_london_parts",
    # UTC formatting
    "to_utc_string",
    # Working hours
    "in_working_hours",
    "in_working_hours_london",
    "is_working_day",
    # DST transitions
    "dst_transition_dates",
    "clock_change_dates",
    "next_dst_transition",
    "next_clock_change",
    # Constants
    "DEFAULT_TIMEZONE",
    "DEFAULT_WORKING_HOURS",
    "DEFAULT_WORKING_DAYS",
]
