import { describe, expect, it } from "vitest";

import { sealSession, unsealSession } from "@/server/auth/session";

const PASSWORD = "a-secret-password-of-at-least-32-chars";

describe("session sealing", () => {
  it("roundtrips a user id", async () => {
    const sealed = await sealSession({ userId: "abc123" }, PASSWORD);
    expect(await unsealSession(sealed, PASSWORD)).toEqual({ userId: "abc123" });
  });

  it("stores no role or identity claims beyond userId", async () => {
    const sealed = await sealSession({ userId: "abc123" }, PASSWORD);
    expect(sealed).not.toContain("abc123");
    expect(sealed).not.toContain("admin");
  });

  it("rejects tampered, garbage, and wrong-password seals", async () => {
    const sealed = await sealSession({ userId: "abc123" }, PASSWORD);
    expect(await unsealSession(sealed.slice(0, -4) + "AAAA", PASSWORD)).toBeNull();
    expect(await unsealSession("garbage", PASSWORD)).toBeNull();
    expect(await unsealSession(undefined, PASSWORD)).toBeNull();
    expect(
      await unsealSession(sealed, "a-different-password-of-32-chars-ok"),
    ).toBeNull();
  });
});
