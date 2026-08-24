import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    fileParallelism: false,
    reporters: ["default", "json"],
    outputFile: {
      json: "test-results/latest.json",
    },
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
  },
});
