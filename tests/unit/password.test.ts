import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/server/auth/password";

describe("Argon2id password hashing", () => {
  it("produces PHC-format hashes and verifies roundtrip", async () => {
    const hash = await hashPassword("corr3ct horse battery");
    expect(hash).toMatch(/^\$argon2id\$v=19\$m=\d+,t=\d+,p=\d+\$.+\$.+$/);
    expect(await verifyPassword("corr3ct horse battery", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("corr3ct horse battery");
    expect(await verifyPassword("wrong password 123", hash)).toBe(false);
  });

  it("rejects malformed or tampered hashes", async () => {
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
    const hash = await hashPassword("p4ssword!");
    const tampered = hash.replace(/.$/, hash.endsWith("A") ? "B" : "A");
    expect(await verifyPassword("p4ssword!", tampered)).toBe(false);
  });

  it("never returns the plaintext in the hash", async () => {
    const hash = await hashPassword("s3cretValue!");
    expect(hash).not.toContain("s3cretValue!");
  });
});
