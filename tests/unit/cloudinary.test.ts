import { describe, expect, it } from "vitest";

import { signParams } from "@/server/storage/cloudinary";

describe("cloudinary signature", () => {
  it("signs alphabetically-sorted params with the API secret", () => {
    // Matches Cloudinary's documented example construction.
    const sig = signParams(
      { timestamp: 1739318400, folder: "products" },
      "test_secret",
    );
    expect(sig).toMatch(/^[0-9a-f]{40}$/);
    expect(signParams({ folder: "products", timestamp: 1739318400 }, "s")).toBe(
      signParams({ timestamp: 1739318400, folder: "products" }, "s"),
    );
  });

  it("changes when the secret changes", () => {
    const p = { timestamp: 1, folder: "products" };
    expect(signParams(p, "a")).not.toBe(signParams(p, "b"));
  });
});
