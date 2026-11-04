import { describe, expect, it } from "vitest";

import {
  generateGuestToken,
  guestCookieOptions,
  isValidGuestToken,
} from "@/server/guest/guest-session";

describe("guest session tokens", () => {
  it("generates 256-bit hex tokens", () => {
    const token = generateGuestToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
    expect(isValidGuestToken(token)).toBe(true);
  });

  it("generates distinct tokens (no sequential ids)", () => {
    const a = generateGuestToken();
    const b = generateGuestToken();
    expect(a).not.toBe(b);
  });

  it("rejects malformed tokens", () => {
    expect(isValidGuestToken(undefined)).toBe(false);
    expect(isValidGuestToken("1")).toBe(false);
    expect(isValidGuestToken("z".repeat(64))).toBe(false);
  });
});

describe("guest cookie options", () => {
  it("is HttpOnly, SameSite=Lax, root-scoped", () => {
    const options = guestCookieOptions();
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.path).toBe("/");
    expect(options.maxAge).toBeGreaterThan(0);
  });

  it("enables Secure only in production", () => {
    expect(guestCookieOptions().secure).toBe(false); // NODE_ENV=test
  });
});
