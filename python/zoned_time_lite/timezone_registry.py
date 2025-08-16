"""
Timezone metadata registry

This registry contains minimal metadata for supported timezones.
Actual DST transitions are determined by platform timezone databases.
"""

from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo, available_timezones

from .types import TimezoneMetadata, PreferredAbbreviations, SupportedTimezone
from .validator import validate_timezone

# Registry of supported timezone metadata
TIMEZONE_REGISTRY: dict[SupportedTimezone, TimezoneMetadata] = {
    "Europe/London": TimezoneMetadata(
        id="Europe/London",
        standard_offset=0,  # GMT is UTC+0
        dst_offset=60,  # BST is UTC+1
        preferred_abbreviations=PreferredAbbreviations(
            standard="GMT",
            dst="BST"
        ),
        fallback_format="GMT{offset}",
    ),

    "America/New_York": TimezoneMetadata(
        id="America/New_York",
        standard_offset=-300,  # EST is UTC-5
        dst_offset=-240,  # EDT is UTC-4
        preferred_abbreviations=PreferredAbbreviations(
            standard="EST",
            dst="EDT"
        ),
        fallback_format="GMT{offset}",
    ),

    "America/Los_Angeles": TimezoneMetadata(
        id="America/Los_Angeles",
        standard_offset=-480,  # PST is UTC-8
        dst_offset=-420,  # PDT is UTC-7
        preferred_abbreviations=PreferredAbbreviations(
            standard="PST",
            dst="PDT"
        ),
        fallback_format="GMT{offset}",
    ),

    "Europe/Paris": TimezoneMetadata(
        id="Europe/Paris",
        standard_offset=60,  # CET is UTC+1
        dst_offset=120,  # CEST is UTC+2
        preferred_abbreviations=PreferredAbbreviations(
            standard="CET",
            dst="CEST"
        ),
        fallback_format="GMT{offset}",
    ),

    "Europe/Berlin": TimezoneMetadata(
        id="Europe/Berlin",
        standard_offset=60,  # CET is UTC+1
        dst_offset=120,  # CEST is UTC+2
        preferred_abbreviations=PreferredAbbreviations(
            standard="CET",
            dst="CEST"
        ),
        fallback_format="GMT{offset}",
    ),

    "Asia/Tokyo": TimezoneMetadata(
        id="Asia/Tokyo",
        standard_offset=540,  # JST is UTC+9
        # No DST in Japan
        fallback_format="GMT{offset}",
    ),

    "Australia/Sydney": TimezoneMetadata(
        id="Australia/Sydney",
        standard_offset=600,  # AEST is UTC+10
        dst_offset=660,  # AEDT is UTC+11
        preferred_abbreviations=PreferredAbbreviations(
            standard="AEST",
            dst="AEDT"
        ),
        fallback_format="GMT{offset}",
    ),
}


def get_timezone_metadata(timezone: str) -> TimezoneMetadata:
    """
    Get timezone metadata for a supported timezone.

    Args:
        timezone: The timezone identifier

    Returns:
        Timezone metadata

    Raises:
        ValueError: If timezone is not supported
    """
    validate_timezone(timezone)

    if timezone not in TIMEZONE_REGISTRY:
        supported = ", ".join(TIMEZONE_REGISTRY.keys())
        raise ValueError(
            f"Unsupported timezone: {timezone}. Supported timezones: {supported}"
        )

    return TIMEZONE_REGISTRY[timezone]  # type: ignore


def is_supported_timezone(timezone: str) -> bool:
    """
    Check if a timezone is supported.

    Args:
        timezone: The timezone identifier to check

    Returns:
        True if the timezone is supported
    """
    return timezone in TIMEZONE_REGISTRY


def validate_platform_timezone(timezone: str) -> None:
    """
    Validate that the platform supports a timezone.

    Args:
        timezone: The timezone identifier to validate

    Raises:
        ValueError: If the timezone is not available on the platform
    """
    try:
        # Test if zoneinfo supports this timezone
        ZoneInfo(timezone)

        # Double-check it's in available timezones
        if timezone not in available_timezones():
            raise ValueError(
                f"Timezone '{timezone}' not in available_timezones()")

    except Exception as e:
        raise ValueError(
            f"Timezone '{timezone}' not available on this system. "
            f"Please ensure your system has up-to-date timezone data. "
            f"Error: {e}"
        )


def get_supported_timezones() -> list[SupportedTimezone]:
    """
    Get all supported timezone identifiers.

    Returns:
        List of supported timezone identifiers
    """
    return list(TIMEZONE_REGISTRY.keys())
