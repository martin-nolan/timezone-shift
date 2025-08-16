# Zoned Time Lite

A lightweight, dependency-free timezone utility with multi-timezone DST support for TypeScript/JavaScript.

## Features

- 🌍 **Multi-timezone support**: Europe/London, America/New_York, America/Los_Angeles, Europe/Paris, Europe/Berlin, Asia/Tokyo, Australia/Sydney
- 🕒 **Accurate DST handling**: Uses platform timezone databases for always-current DST rules
- 🪶 **Lightweight**: Zero external dependencies, minimal footprint
- 🔧 **Type-safe**: Complete TypeScript definitions
- 🌐 **Cross-platform**: Works in Node.js and browsers
- 🧪 **Well-tested**: 162+ tests including DST edge cases

## Installation

```bash
npm install zoned-time-lite
```

## Quick Start

```typescript
import {
  isDST,
  toTimezoneString,
  toTimezoneParts,
  dstTransitionDates,
} from "zoned-time-lite";

const date = new Date("2024-07-15T12:00:00Z");

// Check DST status
console.log(isDST(date, "Europe/London")); // true (BST)
console.log(isDST(date, "Asia/Tokyo")); // false (no DST)

// Format dates in different timezones
console.log(toTimezoneString(date, "America/New_York")); // "2024-07-15 08:00:00 EDT"
console.log(toTimezoneString(date, "Europe/London")); // "2024-07-15 13:00:00 BST"

// Extract timezone components
const parts = toTimezoneParts(date, "Europe/London");
console.log(parts); // { year: 2024, month: 7, day: 15, hour: 13, minute: 0, second: 0 }

// Get DST transition dates
const transitions = dstTransitionDates(2024, "America/New_York");
console.log(transitions?.dstStartUtc); // 2024-03-10T07:00:00.000Z
```

## Core Functions

| Function                             | Description                                 |
| ------------------------------------ | ------------------------------------------- |
| `isDST(date, timezone)`              | Check if date is in DST                     |
| `toTimezoneString(date, timezone)`   | Format date as timezone string              |
| `toTimezoneParts(date, timezone)`    | Extract timezone date components            |
| `fromTimezoneParts(parts, timezone)` | Create UTC date from timezone parts         |
| `dstTransitionDates(year, timezone)` | Get DST start/end dates for year            |
| `inWorkingHours(date, timezone)`     | Check if date is in working hours (9-17:30) |
| `isWorkingDay(date)`                 | Check if date is a weekday                  |

## Supported Timezones

- `Europe/London` (GMT/BST)
- `America/New_York` (EST/EDT)
- `America/Los_Angeles` (PST/PDT)
- `Europe/Paris` (CET/CEST)
- `Europe/Berlin` (CET/CEST)
- `Asia/Tokyo` (JST, no DST)
- `Australia/Sydney` (AEDT/AEST)

## Advanced Usage

### Working with Business Hours

```typescript
import {
  inWorkingHours,
  isWorkingDay,
  inWorkingHoursLondon,
} from "zoned-time-lite";

const meetingTime = new Date("2024-07-15T14:30:00Z");

// Default working hours: 9:00-17:30 local time
console.log(inWorkingHours(meetingTime, "Europe/London")); // true
console.log(inWorkingHours(meetingTime, "America/New_York")); // true (10:30 EDT)

// Check if it's a working day (Monday-Friday)
console.log(isWorkingDay(meetingTime)); // true (if Monday-Friday)

// London-specific convenience function
console.log(inWorkingHoursLondon(meetingTime)); // true
```

### Handling DST Transitions

```typescript
import { dstTransitionDates, isDST } from "zoned-time-lite";

// Get DST boundaries for a year
const ukTransitions = dstTransitionDates(2024, "Europe/London");
console.log(ukTransitions?.dstStartUtc); // 2024-03-31T01:00:00.000Z (BST starts)
console.log(ukTransitions?.dstEndUtc); // 2024-10-27T01:00:00.000Z (GMT resumes)

// Test dates around transitions
const beforeDST = new Date("2024-03-30T12:00:00Z");
const afterDST = new Date("2024-04-01T12:00:00Z");

console.log(isDST(beforeDST, "Europe/London")); // false (GMT)
console.log(isDST(afterDST, "Europe/London")); // true (BST)
```

## License

MIT - see [LICENSE](LICENSE) file.

---

**Need more examples?** Check out the [Release Notes](RELEASE_NOTES.md) for detailed documentation and use cases.
