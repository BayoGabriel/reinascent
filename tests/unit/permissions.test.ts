import { describe, expect, it } from "vitest";

import {
  hasPermission,
  permissionsForRoles,
} from "@/config/permissions";

describe("permission helpers", () => {
  it("grants admin capabilities to admins only", () => {
    expect(hasPermission(["admin"], "admin:access")).toBe(true);
    expect(hasPermission(["customer"], "admin:access")).toBe(false);
    expect(hasPermission(["customer"], "catalog:manage")).toBe(false);
  });

  it("grants customers their own-order permissions", () => {
    expect(hasPermission(["customer"], "orders:read-own")).toBe(true);
    expect(hasPermission(["admin"], "orders:read-own")).toBe(false);
  });

  it("ignores unknown roles and merges multiple roles", () => {
    expect(permissionsForRoles(["bogus"])).toEqual([]);
    const merged = permissionsForRoles(["customer", "admin"]);
    expect(merged).toContain("admin:access");
    expect(merged).toContain("orders:read-own");
  });
});
