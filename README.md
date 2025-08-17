# timezone-shift

[![npm version](https://img.shields.io/npm/v/timezone-shift?color=blue)](https://www.npmjs.com/package/timezone-shift)
[![CI](https://github.com/martin-nolan/timezone-shift/actions/workflows/ci.yml/badge.svg)](https://github.com/martin-nolan/timezone-shift/actions)

🚀 **[Live Demo](https://timezone-shift-demo.netlify.app/)**

Lightweight, dependency-free timezone utility with multi-timezone DST support for TypeScript/JavaScript.

## Features

- 🌍 **Multi-timezone support**: Europe/London, America/New_York, America/Los_Angeles, Europe/Paris, Europe/Berlin, Asia/Tokyo, Australia/Sydney
- 🕒 **Accurate DST handling**: Uses platform timezone databases for always-current DST rules
- 🪶 **Lightweight**: Zero external dependencies, minimal footprint
- 🔧 **Type-safe**: Complete TypeScript definitions
- 🌐 **Cross-platform**: Works in Node.js and browsers
- 🧪 **Well-tested**: 162+ tests including DST edge cases

## Installation

```bash
npm install timezone-shift
```

## Quick Start

```typescript
import { isDST, toTimezoneParts, dstTransitionDates } from "timezone-shift";

// Check if London is in DST
const londonDST = isDST(new Date(), "Europe/London");

// Get timezone parts
const parts = toTimezoneParts(new Date(), "America/New_York");

// Get DST transitions for the year
const transitions = dstTransitionDates(2025, "Europe/London");
```

## Working Hours & Business Logic

```typescript
import {
  inWorkingHours,
  isWorkingDay,
  inWorkingHoursLondon,
} from "timezone-shift";

const meetingTime = new Date("2024-07-15T14:30:00Z");

// Default working hours: 9:00-17:30 local time
console.log(inWorkingHours(meetingTime, "Europe/London")); // true
console.log(inWorkingHours(meetingTime, "America/New_York")); // true (10:30 EDT)

// Check if it's a working day (Monday-Friday)
console.log(isWorkingDay(meetingTime)); // true (if Monday-Friday)

// London-specific convenience function
console.log(inWorkingHoursLondon(meetingTime)); // true
```

## Handling DST Transitions

```typescript
import { dstTransitionDates, isDST } from "timezone-shift";

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

## Development

Clone the repository and install dependencies:

```bash
git clone https://github.com/martin-nolan/timezone-shift.git
cd timezone-shift
npm install
```

Run tests:

```bash
npm test
```

## License

MIT - see [LICENSE](LICENSE) file.

---

**Need more examples?** Check out the [Release Notes](RELEASE_NOTES.md) for detailed documentation and use cases.
