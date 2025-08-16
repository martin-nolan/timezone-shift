/**
 * Cross-implementation validation tests using shared test data
 */

import { describe, it, expect, beforeAll } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

import {
  isDST,
  toTimezoneParts,
  fromTimezoneParts,
  dstTransitionDates,
  toTimezoneString,
  toUTCString,
  inWorkingHours,
  isWorkingDay,
} from "../src/index.js";

interface SharedTestData {
  version: string;
  description: string;
  generatedAt: string;
  testSuites: {
    dstDetection: {
      testCases: Array<{
        name: string;
        timezone: string;
        cases: Array<{
          dateUtc: string;
          expectedDst: boolean;
          description: string;
        }>;
      }>;
    };
    timeConversion: {
      testCases: Array<{
        name: string;
        cases: Array<{
          utcDate?: string;
          timezone?: string;
          expectedParts?: {
            year: number;
            month: number;
            day: number;
            hour: number;
            minute: number;
            second: number;
          };
          parts?: {
            year: number;
            month: number;
            day: number;
            hour: number;
            minute: number;
            second: number;
          };
          expectedUtc?: string;
          description: string;
        }>;
      }>;
    };
    dstTransitions: {
      testCases: Array<{
        name: string;
        timezone: string;
        year: number;
        expectedTransitions: {
          dstStartUtc: string;
          dstEndUtc: string;
        } | null;
        description: string;
      }>;
    };
    timeFormatting: {
      testCases: Array<{
        name: string;
        cases: Array<{
          utcDate?: string;
          timezone?: string;
          expectedFormat?: string;
          date?: string;
          description: string;
        }>;
      }>;
    };
    workingHours: {
      testCases: Array<{
        name: string;
        cases: Array<{
          utcDate: string;
          timezone: string;
          workingHours?: { start: string; end: string };
          workingDays?: number[];
          expected: boolean;
          description: string;
        }>;
      }>;
    };
  };
  performanceBenchmarks: {
    operations: Array<{
      name: string;
      function: string;
      iterations: number;
      testCase: any;
      expectedMaxMs: number;
      description: string;
    }>;
  };
}

let sharedTestData: SharedTestData;

describe("Cross-Implementation Validation Tests", () => {
  beforeAll(() => {
    const testDataPath = join(__dirname, "../test-data/shared-test-data.json");
    const testDataContent = readFileSync(testDataPath, "utf-8");
    sharedTestData = JSON.parse(testDataContent);
  });

  describe("DST Detection Validation", () => {
    it("should pass all shared DST detection test cases", () => {
      for (const testCase of sharedTestData.testSuites.dstDetection.testCases) {
        describe(testCase.name, () => {
          for (const dstCase of testCase.cases) {
            it(dstCase.description, () => {
              const date = new Date(dstCase.dateUtc);
              const result = isDST(date, testCase.timezone);
              expect(result).toBe(dstCase.expectedDst);
            });
          }
        });
      }
    });
  });

  describe("Time Conversion Validation", () => {
    it("should pass all UTC to timezone parts conversions", () => {
      const utcToPartsTests =
        sharedTestData.testSuites.timeConversion.testCases.find(
          (tc) => tc.name === "UTC to timezone parts"
        );

      if (utcToPartsTests) {
        for (const testCase of utcToPartsTests.cases) {
          if (testCase.utcDate && testCase.timezone && testCase.expectedParts) {
            const date = new Date(testCase.utcDate);
            const result = toTimezoneParts(date, testCase.timezone);

            expect(result).toEqual(testCase.expectedParts);
          }
        }
      }
    });

    it("should pass all timezone parts to UTC conversions", () => {
      const partsToUtcTests =
        sharedTestData.testSuites.timeConversion.testCases.find(
          (tc) => tc.name === "Timezone parts to UTC"
        );

      if (partsToUtcTests) {
        for (const testCase of partsToUtcTests.cases) {
          if (testCase.parts && testCase.timezone && testCase.expectedUtc) {
            const result = fromTimezoneParts(testCase.parts, testCase.timezone);
            expect(result.toISOString()).toBe(testCase.expectedUtc);
          }
        }
      }
    });
  });

  describe("DST Transition Validation", () => {
    it("should pass all DST transition calculations", () => {
      for (const testCase of sharedTestData.testSuites.dstTransitions
        .testCases) {
        const result = dstTransitionDates(testCase.year, testCase.timezone);

        if (testCase.expectedTransitions === null) {
          expect(result).toBeNull();
        } else {
          expect(result).not.toBeNull();
          expect(result!.dstStartUtc.toISOString()).toBe(
            testCase.expectedTransitions.dstStartUtc
          );
          expect(result!.dstEndUtc.toISOString()).toBe(
            testCase.expectedTransitions.dstEndUtc
          );
        }
      }
    });
  });

  describe("Time Formatting Validation", () => {
    it("should pass all timezone string formatting tests", () => {
      const timezoneStringTests =
        sharedTestData.testSuites.timeFormatting.testCases.find(
          (tc) => tc.name === "Timezone string formatting"
        );

      if (timezoneStringTests) {
        for (const testCase of timezoneStringTests.cases) {
          if (
            testCase.utcDate &&
            testCase.timezone &&
            testCase.expectedFormat
          ) {
            const date = new Date(testCase.utcDate);
            const result = toTimezoneString(date, testCase.timezone);
            expect(result).toBe(testCase.expectedFormat);
          }
        }
      }
    });

    it("should pass all UTC string formatting tests", () => {
      const utcStringTests =
        sharedTestData.testSuites.timeFormatting.testCases.find(
          (tc) => tc.name === "UTC string formatting"
        );

      if (utcStringTests) {
        for (const testCase of utcStringTests.cases) {
          if (testCase.date && testCase.expectedFormat) {
            const date = new Date(testCase.date);
            const result = toUTCString(date);
            expect(result).toBe(testCase.expectedFormat);
          }
        }
      }
    });
  });

  describe("Working Hours Validation", () => {
    it("should pass all working hours detection tests", () => {
      const workingHoursTests =
        sharedTestData.testSuites.workingHours.testCases.find(
          (tc) => tc.name === "Working hours detection"
        );

      if (workingHoursTests) {
        for (const testCase of workingHoursTests.cases) {
          if (testCase.workingHours) {
            const date = new Date(testCase.utcDate);
            const result = inWorkingHours(
              date,
              testCase.timezone,
              testCase.workingHours.start,
              testCase.workingHours.end
            );
            expect(result).toBe(testCase.expected);
          }
        }
      }
    });

    it("should pass all working day detection tests", () => {
      const workingDayTests =
        sharedTestData.testSuites.workingHours.testCases.find(
          (tc) => tc.name === "Working day detection"
        );

      if (workingDayTests) {
        for (const testCase of workingDayTests.cases) {
          if (testCase.workingDays) {
            const date = new Date(testCase.utcDate);
            const result = isWorkingDay(
              date,
              testCase.timezone,
              testCase.workingDays
            );
            expect(result).toBe(testCase.expected);
          }
        }
      }
    });
  });

  describe("Data Integrity Validation", () => {
    it("should have valid test data structure", () => {
      expect(sharedTestData.version).toBeDefined();
      expect(sharedTestData.testSuites).toBeDefined();
      expect(sharedTestData.performanceBenchmarks).toBeDefined();
    });

    it("should have valid date formats in test data", () => {
      // Check DST detection dates
      for (const testCase of sharedTestData.testSuites.dstDetection.testCases) {
        for (const dstCase of testCase.cases) {
          const date = new Date(dstCase.dateUtc);
          expect(date.getTime()).not.toBeNaN();
          expect(date.toISOString()).toBe(dstCase.dateUtc);
        }
      }

      // Check transition dates
      for (const testCase of sharedTestData.testSuites.dstTransitions
        .testCases) {
        if (testCase.expectedTransitions) {
          const startDate = new Date(testCase.expectedTransitions.dstStartUtc);
          const endDate = new Date(testCase.expectedTransitions.dstEndUtc);
          expect(startDate.getTime()).not.toBeNaN();
          expect(endDate.getTime()).not.toBeNaN();
        }
      }
    });

    it("should have consistent timezone names", () => {
      const supportedTimezones = [
        "Europe/London",
        "America/New_York",
        "America/Los_Angeles",
        "Europe/Paris",
        "Europe/Berlin",
        "Asia/Tokyo",
        "Australia/Sydney",
      ];

      // Check all timezone references in test data
      for (const testCase of sharedTestData.testSuites.dstDetection.testCases) {
        expect(supportedTimezones).toContain(testCase.timezone);
      }
    });
  });
});
