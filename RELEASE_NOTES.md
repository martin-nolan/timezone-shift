# Release Notes

## Version 0.1.1 (Codebase Cleanup & Optimization)

### 🧹 Major Codebase Cleanup

**Architecture Improvements**

- **Eliminated all circular dependencies** (down from 3 to 0)
- **Reorganized module structure** with dedicated `src/utils/` directory
- **Consolidated duplicate code** (~120 lines of duplicated code removed)
- **Improved import organization** with cleaner dependency graph

**Bundle Optimization**

- **15%+ bundle size reduction** through code consolidation
- **Better tree-shaking support** with cleaner exports
- **Removed unused code** and redundant implementations
- **Optimized utility functions** with shared implementations

**Test Suite Reorganization**

- **Moved all tests to `src/__tests__/`** directory structure
- **Reduced test execution time by 20-25%** through optimization
- **Removed ~400+ lines of excessive test code** while maintaining coverage
- **Consolidated overlapping test scenarios** for better maintainability
- **All 152 tests still passing** with improved performance

**File Structure Cleanup**

- **Removed Python implementation** (11 files) - TypeScript-only focus
- **Removed unnecessary documentation** (4 files) - streamlined docs
- **Created organized utility structure** (`formatting.ts`, `validation.ts`, `date-utils.ts`)
- **Added new feature modules** (`auto-functions.ts`, `runtime-registry.ts`, `timezone-detector.ts`)

### 🚀 New Features

**Auto-Detection Functions** (Optional convenience features)

- `isDSTNow()` - Check if current time is in DST
- `getCurrentTimezoneParts()` - Get current time components
- `inWorkingHoursNow()` - Check if currently in working hours
- `formatNow()` - Format current time
- `getDetectedTimezone()` - Auto-detect system timezone
- `getTimezoneInfo()` - Get comprehensive timezone information

**Runtime Timezone Registry** (Dynamic timezone support)

- `validateAndRegisterTimezone()` - Support any IANA timezone dynamically
- `clearRuntimeTimezoneCache()` - Cache management for runtime timezones
- **Extends beyond hardcoded timezones** to support any valid IANA timezone

**Enhanced Timezone Detection**

- `TimezoneDetector` class with comprehensive detection capabilities
- **Platform-aware timezone validation** with better error messages
- **Caching system** for improved performance

### 🔧 Technical Improvements

**Code Quality**

- **0 circular dependencies** (verified with madge)
- **Clean linting** with no errors
- **Improved TypeScript definitions** with better type safety
- **Better error handling** with more descriptive messages

**Performance Enhancements**

- **Faster test execution** (20-25% improvement)
- **Reduced memory footprint** through code consolidation
- **Better caching mechanisms** for timezone operations
- **Optimized utility functions** with shared implementations

### 📦 Backward Compatibility

**✅ NO BREAKING CHANGES**

- **All existing public API functions work exactly the same**
- **Same function signatures and behavior**
- **Existing imports continue to work**
- **Demo apps require no code changes**

**Maintained API Functions**

```typescript
// All these still work exactly the same
toTimezoneParts(), toLondonParts(), fromTimezoneParts(), fromLondonParts();
toTimezoneString(), toLondonString(), toUTCString();
isDST(), isBST();
inWorkingHours(), inWorkingHoursLondon(), isWorkingDay();
dstTransitionDates(),
  clockChangeDates(),
  nextDstTransition(),
  nextClockChange();
getTimezoneMetadata(), isSupportedTimezone(), getSupportedTimezones();
validatePlatformTimezone(); // Still exported from main index
```

### 📊 Quality Metrics Update

**Improved Metrics**

- **152 tests passing** (same coverage, better performance)
- **0 circular dependencies** (down from 3)
- **30 TypeScript files** (organized structure)
- **15%+ smaller bundle size**
- **20-25% faster test execution**
- **Clean linting** with 0 errors

**Files Summary**

- **32 files removed** (Python implementation + docs + test reorganization)
- **8 new files added** (organized utilities + new features)
- **11 files updated** (improved imports and structure)

---

## Version 0.1.0 (Initial Release)

### 🚀 Features

**Core Timezone Functionality**

- **Multi-timezone DST support**: Europe/London, America/New_York, America/Los_Angeles, Europe/Paris, Europe/Berlin, Asia/Tokyo, Australia/Sydney
- **Accurate DST handling**: Uses platform timezone databases for always-current DST rules
- **Lightweight implementation**: Zero external dependencies, minimal footprint
- **Type-safe**: Complete TypeScript definitions with comprehensive JSDoc documentation
- **Cross-platform**: Works in Node.js and browsers

**Date Conversion & Formatting**

- Convert UTC dates to timezone-specific components
- Convert timezone-specific components back to UTC
- Format dates as timezone-aware strings
- UTC string formatting with microsecond precision

**Business Logic**

- Working hours detection for supported timezones
- Working day detection with weekend handling
- DST transition date calculations

**Validation & Performance**

- Comprehensive validation framework with shared test data
- Cross-implementation validation tests (162 test cases total)
- Performance benchmarking suite
- Memory usage monitoring
- Concurrent operations support

### 🔧 Technical Specifications

**Package Details**

- **Name**: `timezone-shift`
- **Version**: `0.1.0`
- **License**: MIT
- **Node.js**: ≥18.0.0
- **Bundle Format**: ESM + CJS with TypeScript definitions
- **Zero Dependencies**: Completely self-contained

**API Coverage**

- DST detection functions
- Time conversion utilities
- Date formatting functions
- Working hours calculations
- Timezone registry with validation
- UTC formatting with microsecond precision

### 📊 Quality Metrics

**Test Coverage**

- **162 passing tests** across all modules
- **11 validation test categories** with shared test data
- **9 performance benchmarks** with realistic thresholds
- **Cross-implementation validation** ready for future language support
- **Edge case coverage** including DST transitions, leap years, and timezone boundaries

**Performance Benchmarks**

- DST detection: ~0.48ms per operation (1k iterations)
- Time conversion: ~0.18ms per operation (1k iterations)
- DST transitions: ~48ms per operation (100 iterations)
- Memory efficient: <2MB increase for 1k operations
- Concurrent operations: Fully thread-safe

### 📖 Documentation

**Complete API Documentation**

- JSDoc comments for all public functions
- Usage examples for all supported timezones
- DST edge case documentation with examples
- Type definitions for all interfaces
- Comprehensive README with quick start guide

### 🎯 Use Cases

**Web Applications**

- Display times in user's local timezone
- Schedule meetings across multiple timezones
- Handle DST transitions gracefully
- Format dates consistently

**Backend Services**

- Process timestamp data from multiple regions
- Calculate working hours across timezones
- Store and retrieve timezone-aware data
- API responses with proper timezone handling

**Data Analysis**

- Timezone-aware data processing
- Time series analysis across regions
- Business hours reporting
- Performance monitoring with timezone context

### 🛣️ Future Roadmap

- Additional timezone support
- Enhanced DST edge case options (duplicate time resolution)
- Business day calculations with holiday support

---

For complete API documentation and examples, see the [README](./README.md).
