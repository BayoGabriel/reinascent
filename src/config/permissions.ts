/**
 * Central role/permission definitions. Roles are coarse account types;
 * permissions are named capabilities checked at the data boundary. New
 * roles (catalog manager, order manager, auditor, agency operator) can be
 * added here without touching UI code.
 */
export const ROLES = ["admin", "customer"] as const;
export type Role = (typeof ROLES)[number];

export const PERMISSIONS = [
  "admin:access",
  "catalog:manage",
  "orders:manage",
  "customers:manage",
  "content:manage",
  "settings:manage",
  "orders:read-own",
  "account:manage",
] as const;
export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  admin: [
    "admin:access",
    "catalog:manage",
    "orders:manage",
    "customers:manage",
    "content:manage",
    "settings:manage",
  ],
  customer: ["orders:read-own", "account:manage"],
};

export function permissionsForRoles(roles: readonly string[]): Permission[] {
  const granted = new Set<Permission>();
  for (const role of roles) {
    for (const permission of ROLE_PERMISSIONS[role as Role] ?? []) {
      granted.add(permission);
    }
  }
  return [...granted];
}

export function hasPermission(
  roles: readonly string[],
  permission: Permission,
): boolean {
  return permissionsForRoles(roles).includes(permission);
}
