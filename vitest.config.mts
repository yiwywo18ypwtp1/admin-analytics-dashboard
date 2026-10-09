import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Unit tests for pure functions (URL parsing, URL building, periods, LIKE escaping).
// No DOM and no database, so the default Node environment is enough.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts"],
  },
});
