import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { hasPermission, type Permission } from "@/config/permissions";
import { readSession } from "@/server/auth/session";
import {
  getUserRepository,
  type PublicUser,
} from "@/server/repositories/user.repository";

/**
 * Data Access Layer for the authenticated user. `cache` deduplicates the
 * session read + user lookup within a single request. Callers that need
 * privileges must still check permissions here — never trust cookie claims.
 */
export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const session = await readSession();
  if (!session) return null;
  const repo = await getUserRepository();
  const user = await repo.findById(session.userId);
  if (!user || user.status !== "active") return null;
  return user;
});

export async function requireUser(): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

/**
 * Authorize a privileged operation. Returns the user when allowed.
 * Callers decide the failure mode: pages typically render a forbidden
 * state, while actions/route handlers translate `null` into 401/403.
 */
export async function requirePermission(
  permission: Permission,
): Promise<PublicUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (!hasPermission(user.roles, permission)) return null;
  return user;
}

export async function requireAdmin(): Promise<PublicUser | null> {
  return requirePermission("admin:access");
}
