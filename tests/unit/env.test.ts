import { describe, expect, it } from "vitest";

import { parseServerEnv } from "@/lib/env";

const VALID = {
  NODE_ENV: "test",
  MONGODB_URI: "mongodb://localhost:27017",
  MONGODB_DB: "appdb",
  SESSION_PASSWORD: "a-secret-password-of-at-least-32-chars",
};

describe("parseServerEnv", () => {
  it("accepts a complete environment", () => {
    const env = parseServerEnv(VALID);
    expect(env.MONGODB_DB).toBe("appdb");
    expect(env.NODE_ENV).toBe("test");
  });

  it("rejects missing MONGODB_URI without echoing values", () => {
    const { MONGODB_URI, ...rest } = VALID;
    void MONGODB_URI;
    expect(() => parseServerEnv(rest)).toThrowError(/MONGODB_URI/);
  });

  it("rejects a short SESSION_PASSWORD", () => {
    expect(() =>
      parseServerEnv({ ...VALID, SESSION_PASSWORD: "short" }),
    ).toThrowError(/SESSION_PASSWORD/);
  });

  it("defaults NODE_ENV when absent", () => {
    const { NODE_ENV, ...rest } = VALID;
    void NODE_ENV;
    expect(parseServerEnv(rest).NODE_ENV).toBe("development");
  });
});
