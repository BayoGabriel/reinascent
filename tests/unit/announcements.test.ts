import { describe, expect, it } from "vitest";

import { announcementInputSchema } from "@/features/announcements/schema";
import { filterLive } from "@/features/announcements/schedule";
import type { Announcement } from "@/features/announcements/types";

function item(partial: Partial<Announcement>): Announcement {
  return {
    id: "a1",
    text: "Delivery Nationwide",
    href: null,
    variant: "default",
    icon: "truck",
    isActive: true,
    order: 0,
    startsAt: null,
    endsAt: null,
    createdAt: "",
    updatedAt: "",
    ...partial,
  };
}

describe("filterLive", () => {
  const now = Date.parse("2026-06-01T12:00:00Z");

  it("keeps items without schedule windows", () => {
    expect(filterLive([item({})], now)).toHaveLength(1);
  });

  it("keeps items inside their window", () => {
    const a = item({
      startsAt: "2026-05-01T00:00:00Z",
      endsAt: "2026-07-01T00:00:00Z",
    });
    expect(filterLive([a], now)).toHaveLength(1);
  });

  it("drops items that have not started or have ended", () => {
    const future = item({ startsAt: "2026-07-01T00:00:00Z" });
    const past = item({ endsAt: "2026-05-01T00:00:00Z" });
    expect(filterLive([future, past], now)).toHaveLength(0);
  });
});

describe("announcementInputSchema", () => {
  it("applies defaults to a minimal payload", () => {
    const parsed = announcementInputSchema.parse({ text: "Hello" });
    expect(parsed.variant).toBe("default");
    expect(parsed.isActive).toBe(true);
    expect(parsed.order).toBe(0);
  });

  it("accepts internal paths and https links", () => {
    expect(
      announcementInputSchema.safeParse({ text: "Sale", href: "/products" }).success,
    ).toBe(true);
    expect(
      announcementInputSchema.safeParse({ text: "Sale", href: "https://x.test/sale" })
        .success,
    ).toBe(true);
  });

  it("rejects unsafe hrefs and empty text", () => {
    expect(
      announcementInputSchema.safeParse({ text: "X", href: "javascript:alert(1)" })
        .success,
    ).toBe(false);
    expect(announcementInputSchema.safeParse({ text: "   " }).success).toBe(false);
  });
});
