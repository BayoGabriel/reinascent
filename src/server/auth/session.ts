import "server-only";

import { cookies } from "next/headers";
import { sealData, unsealData } from "iron-session";

import { getServerEnv, isProduction } from "@/lib/env";

/**
 * Stateless session: an iron-session sealed payload holding only the user id.
 * Roles and status are re-read from MongoDB on every request, so suspending
 * an account takes effect immediately and the cookie carries no privileges.
 */
export const SESSION_COOKIE = "ske_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export interface SessionData {
  userId: string;
}

function cookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}

/** Seal session data into a cookie value; pure and unit-testable. */
export async function sealSession(
  data: SessionData,
  password: string,
): Promise<string> {
  return sealData(data, {
    password,
    ttl: SESSION_TTL_SECONDS,
  });
}

/** Unseal a cookie value; returns null when missing, invalid, or expired. */
export async function unsealSession(
  value: string | undefined,
  password: string,
): Promise<SessionData | null> {
  if (!value) return null;
  try {
    const data = await unsealData<SessionData>(value, {
      password,
      ttl: SESSION_TTL_SECONDS,
    });
    return typeof data?.userId === "string" ? { userId: data.userId } : null;
  } catch {
    return null;
  }
}

export async function createSession(userId: string): Promise<void> {
  const { SESSION_PASSWORD } = getServerEnv();
  const sealed = await sealSession({ userId }, SESSION_PASSWORD);
  (await cookies()).set(SESSION_COOKIE, sealed, cookieOptions());
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function readSession(): Promise<SessionData | null> {
  const { SESSION_PASSWORD } = getServerEnv();
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return unsealSession(value, SESSION_PASSWORD);
}
