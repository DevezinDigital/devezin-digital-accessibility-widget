import { defineConfig } from "vitest/config";

// The package's own tests live in tests/. The templates/ tree is scaffolded
// into consuming projects and imports "@devezindigital/accessibility/*", which
// only resolves once installed — so it's excluded from this repo's test run.
export default defineConfig({
  test: {
    exclude: ["**/node_modules/**", "**/dist/**", "**/templates/**"],
  },
});
