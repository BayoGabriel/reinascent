/**
 * Guest shopping session. A cryptographically random 256-bit token stored
 * in a hardened cookie identifies an anonymous cart; it conveys no user
 * identity or role. proxy.ts issues the cookie on storefront routes so a
 * guest has a stable session before they ever hit the cart.
 *
 * A future `carts` collection will key documents by this token. If a guest
 * later registers, eligible guest orders may be claimed only after email
 * verification — never via the token or an order number alone.
 */
import { cookies } from "next/headers";

/**
 * Intentionally free of "server-only" imports: proxy.ts also uses these
 * helpers and does not run under the react-server resolution condition.
 */
export const GUEST_COOKIE = "ske_guest";
const GUEST_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export function generateGuestToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function guestCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: GUEST_TTL_SECONDS,
  };
}

export function isValidGuestToken(token: string | undefined): token is string {
  return typeof token === "string" && /^[0-9a-f]{64}$/.test(token);
}

/** Read the guest session id inside server code; null when absent. */
export async function getGuestSessionId(): Promise<string | null> {
  const token = (await cookies()).get(GUEST_COOKIE)?.value;
  return isValidGuestToken(token) ? token : null;
}

/** Ensure a guest token exists (Server Actions / Route Handlers only). */
export async function ensureGuestSession(): Promise<string> {
  const store = await cookies();
  const existing = store.get(GUEST_COOKIE)?.value;
  if (isValidGuestToken(existing)) return existing;
  const token = generateGuestToken();
  store.set(GUEST_COOKIE, token, guestCookieOptions());
  return token;
}
