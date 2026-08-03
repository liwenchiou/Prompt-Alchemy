import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["@testing-library/jest-dom/vitest"],
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    exclude: ["e2e/**", "node_modules/**"],
  },
});
