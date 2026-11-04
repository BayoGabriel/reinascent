import "server-only";

import { hasPermission, type Permission } from "@/config/permissions";
import { apiError } from "@/lib/errors";
import { getCurrentUser } from "@/server/auth/current-user";
import { rateLimiter, rateLimitKey } from "@/server/security/rate-limit";

/**
 * Guard for admin Route Handlers: rate limit → session → permission.
 * Returns the Response to send, or null when the request may proceed.
 */
export async function apiGuard(
  request: Request,
  permission: Permission,
): Promise<Response | null> {
  const key = rateLimitKey(`api:${permission}`, request.headers.get("x-forwarded-for"));
  if (!rateLimiter.consume(key, 120, 60_000)) {
    return Response.json(apiError("rate_limited", "Too many requests."), {
      status: 429,
    });
  }
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(apiError("unauthorized", "Sign in required."), {
      status: 401,
    });
  }
  if (!hasPermission(user.roles, permission)) {
    return Response.json(apiError("forbidden", "You do not have access to this resource."), {
      status: 403,
    });
  }
  return null;
}
