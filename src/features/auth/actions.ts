"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { logger } from "@/lib/logger";
import { ServiceError } from "@/lib/errors";
import { createSession, destroySession } from "@/server/auth/session";
import { rateLimiter, rateLimitKey } from "@/server/security/rate-limit";
import {
  registerCustomer,
  verifyCredentials,
} from "@/server/services/user.service";
import { registerSchema, signInSchema } from "@/features/auth/schemas";
import { claimGuestWishlistForUser } from "@/features/wishlist/service";
import type { AuthFormState } from "@/features/auth/types";

const GENERIC_AUTH_ERROR = "Invalid email or password.";

async function clientIpKey(prefix: string): Promise<string> {
  const forwarded = (await headers()).get("x-forwarded-for");
  return rateLimitKey(prefix, forwarded);
}

export async function signInAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const key = await clientIpKey("sign-in");
  if (!rateLimiter.consume(key, 10, 5 * 60_000)) {
    return { message: "Too many attempts. Try again later." };
  }

  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  let user;
  try {
    user = await verifyCredentials(parsed.data.email, parsed.data.password);
  } catch {
    logger.error("Sign-in credential check failed unexpectedly");
    return { message: "Sign-in is temporarily unavailable." };
  }
  if (!user) {
    return { message: GENERIC_AUTH_ERROR };
  }

  await createSession(user._id.toHexString());
  await claimGuestWishlistForUser(user._id.toHexString());
  logger.info("User signed in", { userId: user._id.toHexString() });
  redirect(user.roles.includes("admin") ? "/admin" : "/");
}

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const key = await clientIpKey("register");
  if (!rateLimiter.consume(key, 5, 60 * 60_000)) {
    return { message: "Too many attempts. Try again later." };
  }

  const parsed = registerSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const user = await registerCustomer(parsed.data);
    await createSession(user._id.toHexString());
    await claimGuestWishlistForUser(user._id.toHexString());
    logger.info("Customer registered", { userId: user._id.toHexString() });
  } catch (error) {
    if (error instanceof ServiceError) {
      return { message: error.message };
    }
    logger.error("Registration failed unexpectedly");
    return { message: "Registration failed. Please try again." };
  }
  redirect("/");
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/sign-in");
}
