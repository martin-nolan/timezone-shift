# timezone-shift

[![npm version](https://img.shields.io/npm/v/timezone-shift?color=blue)](https://www.npmjs.com/package/timezone-shift)
[![CI](https://github.com/martin-nolan/timezone-shift/actions/workflows/ci.yml/badge.svg)](https://github.com/martin-nolan/timezone-shift/actions)

🚀 **[Live Demo](https://timezone-shift-demo.netlify.app/)**

Lightweight timezone utility with automatic detection and DST support for TypeScript/JavaScript.

## Features

- 🤖 **Auto timezone detection** - Zero-config for browser and Node.js
- 🌍 **Universal timezone support** - Any valid IANA timezone
- 🕒 **Accurate DST handling** - Uses platform timezone databases
- 🪶 **Zero dependencies** - Minimal footprint
- 🔧 **Type-safe** - Complete TypeScript definitions
- 🔄 **Backward compatible** - Existing code works unchanged

## Installation

```bash
npm install timezone-shift
```

## Quick Start

```typescript
import { isDSTNow, getCurrentTimezoneParts, formatNow } from "timezone-shift";

// Auto-detection (new)
const isInDST = isDSTNow();
const parts = getCurrentTimezoneParts();
const formatted = formatNow();

// Traditional usage (still works)
import { isDST, toTimezoneParts } from "timezone-shift";
const londonDST = isDST(new Date(), "Europe/London");
const nyParts = toTimezoneParts(new Date(), "America/New_York");
```

## Core Functions

### DST Detection

```typescript
import { isDST, isDSTNow } from "timezone-shift";

isDST(date, "Europe/London"); // Check specific timezone
isDSTNow(); // Check current timezone
```

### Time Conversion

```typescript
import { toTimezoneParts, getCurrentTimezoneParts } from "timezone-shift";

toTimezoneParts(date, timezone); // Convert to timezone parts
getCurrentTimezoneParts(); // Get current timezone parts
```

### Working Hours

```typescript
import { inWorkingHours, inWorkingHoursNow } from "timezone-shift";

inWorkingHours(date, timezone); // Check business hours
inWorkingHoursNow(); // Check current business hours
```

### DST Transitions

```typescript
import { dstTransitionDates, nextDstTransition } from "timezone-shift";

dstTransitionDates(2024, "Europe/London"); // Get year's DST dates
nextDstTransition(date, timezone); // Next transition
```

## Auto-Detection

```typescript
import { getDetectedTimezone, getTimezoneInfo } from "timezone-shift";

const timezone = getDetectedTimezone(); // "Europe/London"
const info = getTimezoneInfo(); // Detailed timezone info
```

## Supported Timezones

Works with any IANA timezone identifier:

- `Europe/London`, `America/New_York`, `Asia/Tokyo`
- `Pacific/Auckland`, `America/Sao_Paulo`, `Asia/Kolkata`
- And 400+ more...

## Migration

**No breaking changes** - all existing code continues to work. New auto-detection functions are optional additions.

## License

MIT
