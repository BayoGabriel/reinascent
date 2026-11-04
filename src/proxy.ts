import { NextResponse, type NextRequest } from "next/server";
import { unsealData } from "iron-session";

import {
  GUEST_COOKIE,
  generateGuestToken,
  guestCookieOptions,
  isValidGuestToken,
} from "@/server/guest/guest-session";

// Mirror of SESSION_COOKIE in server/auth/session.ts — kept as a literal so
// the proxy bundle stays free of server-only imports.
const SESSION_COOKIE = "ske_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

/** Optimistic session check only — the admin layout re-verifies server-side. */
async function hasValidSession(request: NextRequest): Promise<boolean> {
  const password = process.env.SESSION_PASSWORD;
  const value = request.cookies.get(SESSION_COOKIE)?.value;
  if (!password || !value) return false;
  try {
    const data = await unsealData<{ userId?: string }>(value, {
      password,
      ttl: SESSION_TTL_SECONDS,
    });
    return typeof data?.userId === "string";
  } catch {
    return false;
  }
}

/**
 * Issues an anonymous guest-shopping cookie on storefront routes and
 * performs an optimistic session redirect for /admin. Optimistic only —
 * every privileged operation still authorizes on the server at the data
 * boundary (admin layout gate, apiGuard, services).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!(await hasValidSession(request))) {
      const url = new URL("/sign-in", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const response = NextResponse.next();
  const existing = request.cookies.get(GUEST_COOKIE)?.value;
  if (!isValidGuestToken(existing)) {
    response.cookies.set(
      GUEST_COOKIE,
      generateGuestToken(),
      guestCookieOptions(),
    );
  }
  return response;
}

export const config = {
  matcher: [
    "/",
    "/about",
    "/ideas",
    "/products/:path*",
    "/cart/:path*",
    "/wishlist",
    "/checkout/:path*",
    "/orders/:path*",
    "/admin/:path*",
  ],
};
