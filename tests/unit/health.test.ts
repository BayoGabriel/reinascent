import { beforeEach, describe, expect, it, vi } from "vitest";

const { pingDatabase } = vi.hoisted(() => ({
  pingDatabase: vi.fn<() => Promise<boolean>>(),
}));

vi.mock("@/server/db/mongodb", () => ({ pingDatabase }));

import { GET } from "@/app/api/health/route";

describe("GET /api/health", () => {
  beforeEach(() => pingDatabase.mockReset());

  it("returns 200 with a generic ok status when MongoDB responds", async () => {
    pingDatabase.mockResolvedValue(true);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("returns 503 with a generic status when MongoDB is unreachable", async () => {
    pingDatabase.mockResolvedValue(false);
    const response = await GET();
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ status: "unavailable" });
  });

  it("never leaks infrastructure details", async () => {
    pingDatabase.mockResolvedValue(false);
    const body = await (await GET()).text();
    expect(body).not.toMatch(/mongodb|localhost|27017|password|uri/i);
  });
});
