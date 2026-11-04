import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // The marker package throws outside the react-server condition; tests
      // exercise server logic directly so the guard is stubbed.
      "server-only": fileURLToPath(
        new URL("./tests/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    env: {
      NODE_ENV: "test",
      MONGODB_URI: "mongodb://localhost:27017",
      MONGODB_DB: "sadikecom_test",
      SESSION_PASSWORD: "test-session-password-with-32-chars!!",
    },
  },
});
