import { describe, expect, it } from "vitest";

import {
  InMemoryRateLimiter,
  rateLimitKey,
} from "@/server/security/rate-limit";

describe("InMemoryRateLimiter", () => {
  it("allows up to the limit then blocks", () => {
    const limiter = new InMemoryRateLimiter();
    for (let i = 0; i < 3; i += 1) {
      expect(limiter.consume("k", 3, 60_000)).toBe(true);
    }
    expect(limiter.consume("k", 3, 60_000)).toBe(false);
  });

  it("tracks keys independently", () => {
    const limiter = new InMemoryRateLimiter();
    limiter.consume("a", 1, 60_000);
    expect(limiter.consume("a", 1, 60_000)).toBe(false);
    expect(limiter.consume("b", 1, 60_000)).toBe(true);
  });

  it("resets after the window expires", async () => {
    const limiter = new InMemoryRateLimiter();
    expect(limiter.consume("k", 1, 5)).toBe(true);
    expect(limiter.consume("k", 1, 5)).toBe(false);
    await new Promise((r) => setTimeout(r, 10));
    expect(limiter.consume("k", 1, 5)).toBe(true);
  });
});

describe("rateLimitKey", () => {
  it("uses the first forwarded IP and a fallback", () => {
    expect(rateLimitKey("sign-in", "1.2.3.4, 5.6.7.8")).toBe("sign-in:1.2.3.4");
    expect(rateLimitKey("sign-in", null)).toBe("sign-in:unknown");
  });
});
