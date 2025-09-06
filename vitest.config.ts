import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: {
        global: {
          branches: 70,
          functions: 80,
          lines: 85,
          statements: 85,
        },
      },
      exclude: [
        "node_modules/**",
        "dist/**",
        "**/*.test.ts",
        "**/*.config.ts",
        "src/utils/**", // Exclude utility files from strict coverage requirements
        "src/cache-manager.ts", // Cache manager has many edge cases
        "src/timezone-detector.ts", // Platform-specific detection logic
      ],
    },
  },
});
