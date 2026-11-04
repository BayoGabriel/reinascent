"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { ServiceError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { getCurrentUser } from "@/server/auth/current-user";
import { rateLimiter, rateLimitKey } from "@/server/security/rate-limit";
import { saveCard, setDefaultCard } from "./cards";
import { createComplaint, setComplaintStatus } from "./complaints";
import {
  changePassword,
  updateAddress,
  updateProfile,
} from "./service";
import {
  addressSchema,
  cardSchema,
  complaintSchema,
  passwordChangeSchema,
  profileSchema,
} from "./schemas";
import type { AccountFormState } from "./types";

async function clientIpKey(prefix: string): Promise<string> {
  const forwarded = (await headers()).get("x-forwarded-for");
  return rateLimitKey(prefix, forwarded);
}

const SIGN_IN: AccountFormState = { message: "Please sign in again." };
const LIMITED: AccountFormState = {
  message: "Too many attempts. Try again later.",
};

function failure(error: unknown, fallback: string): AccountFormState {
  if (error instanceof ServiceError) return { message: error.message };
  logger.error("Account action failed unexpectedly");
  return { message: fallback };
}

export async function updateProfileAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const user = await getCurrentUser();
  if (!user) return SIGN_IN;
  if (!rateLimiter.consume(await clientIpKey("acct-profile"), 15, 5 * 60_000)) {
    return LIMITED;
  }
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await updateProfile(user, parsed.data);
  } catch (error) {
    return failure(error, "Could not save your details.");
  }
  revalidatePath("/account");
  return { ok: true, message: "Details saved." };
}

export async function changePasswordAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const user = await getCurrentUser();
  if (!user) return SIGN_IN;
  if (!rateLimiter.consume(await clientIpKey("acct-password"), 8, 10 * 60_000)) {
    return LIMITED;
  }
  const parsed = passwordChangeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await changePassword(
      user._id.toHexString(),
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );
  } catch (error) {
    return failure(error, "Could not update your password.");
  }
  return { ok: true, message: "Password updated." };
}

export async function updateAddressAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const user = await getCurrentUser();
  if (!user) return SIGN_IN;
  if (!rateLimiter.consume(await clientIpKey("acct-address"), 15, 5 * 60_000)) {
    return LIMITED;
  }
  const parsed = addressSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  await updateAddress(user._id.toHexString(), parsed.data);
  revalidatePath("/account/address");
  return { ok: true, message: "Address saved." };
}

export async function saveCardAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const user = await getCurrentUser();
  if (!user) return SIGN_IN;
  if (!rateLimiter.consume(await clientIpKey("acct-card"), 10, 10 * 60_000)) {
    return LIMITED;
  }
  const parsed = cardSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await saveCard(user._id.toHexString(), parsed.data);
  } catch (error) {
    return failure(error, "Could not save the card.");
  }
  revalidatePath("/account/payment-methods");
  revalidatePath("/account/saved-cards");
  return { ok: true, message: "Card updated." };
}

/** Bound action — Saved Cards checkbox picks the default card. */
export async function setDefaultCardAction(cardId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await setDefaultCard(user._id.toHexString(), cardId);
  revalidatePath("/account/saved-cards");
  revalidatePath("/account/payment-methods");
}

/** Bound action — Complaints "Mark as Solved" checkbox. */
export async function setComplaintStatusAction(
  complaintId: string,
  solved: boolean,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await setComplaintStatus(
    user._id.toHexString(),
    complaintId,
    solved ? "solved" : "open",
  );
  revalidatePath("/account/complaints");
}

export async function createComplaintAction(
  _prev: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> {
  const user = await getCurrentUser();
  if (!user) return SIGN_IN;
  if (!rateLimiter.consume(await clientIpKey("acct-complaint"), 10, 60 * 60_000)) {
    return LIMITED;
  }
  const parsed = complaintSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  try {
    await createComplaint(user._id.toHexString(), parsed.data);
  } catch (error) {
    return failure(error, "Could not submit your complaint.");
  }
  revalidatePath("/account/complaints");
  return { ok: true, message: "Complaint submitted." };
}
