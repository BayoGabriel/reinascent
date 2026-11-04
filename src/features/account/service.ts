import "server-only";

import { ServiceError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import {
  getOrderRepository,
  toOrder,
} from "@/server/repositories/order.repository";
import {
  DuplicateEmailError,
  getUserRepository,
  type PublicUser,
} from "@/server/repositories/user.repository";
import { normalizeEmail } from "@/server/services/user.service";
import type { Order } from "@/features/orders/types";
import type { AddressInput, ProfileInput } from "./schemas";
import type { AddressView, TransactionRow } from "./types";

const PAGE_LIMIT = 50;

/** Orders the signed-in user placed, newest first. */
export async function listUserOrders(
  userId: string,
  limit = PAGE_LIMIT,
): Promise<Order[]> {
  const repo = await getOrderRepository();
  if (!repo) return [];
  const docs = await repo.listByUser(userId, limit);
  return docs.map(toOrder);
}

/** Paid orders as a transaction ledger. */
export async function listTransactions(
  userId: string,
): Promise<TransactionRow[]> {
  const orders = await listUserOrders(userId);
  return orders
    .filter((o) => o.paymentStatus === "paid" && o.paidAt)
    .map((o) => ({
      orderNumber: o.orderNumber,
      reference: o.paymentReference,
      method: o.paymentMethod,
      channel: o.paymentChannel,
      total: o.total,
      currency: o.currency,
      paidAt: o.paidAt as string,
    }));
}

/** Stored shipping address, falling back to the latest order's details. */
export async function getAddressView(
  user: PublicUser,
): Promise<AddressView | null> {
  const saved = user.shippingAddress;
  if (saved) {
    return { ...saved, email: user.email };
  }
  const repo = await getOrderRepository();
  if (!repo) return { name: "", phone: "", address: "", email: user.email };
  const [latest] = await repo.listByUser(user._id.toHexString(), 1);
  if (!latest) return { name: "", phone: "", address: "", email: user.email };
  return {
    name: latest.customer.name,
    phone: latest.customer.phone,
    address: latest.shipping.address,
    email: user.email,
  };
}

export async function updateProfile(
  user: PublicUser,
  input: ProfileInput,
): Promise<void> {
  const repo = await getUserRepository();
  const email = normalizeEmail(input.email);
  const existing = await repo.findByEmail(email);
  if (existing && existing._id.toHexString() !== user._id.toHexString()) {
    throw new ServiceError("conflict", "That email is already in use.", 409);
  }
  try {
    await repo.updateProfile(user._id.toHexString(), {
      firstName: input.firstName,
      lastName: input.lastName,
      displayName: `${input.firstName} ${input.lastName}`.trim(),
      email,
      phone: input.phone,
    });
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      throw new ServiceError("conflict", "That email is already in use.", 409);
    }
    throw error;
  }
}

/** Verify the current password before rotating — never trust the form. */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const repo = await getUserRepository();
  const record = await repo.findCredentialsById(userId);
  const valid =
    record && (await verifyPassword(currentPassword, record.passwordHash));
  if (!record || !valid) {
    throw new ServiceError("bad_request", "Current password is incorrect.", 400);
  }
  await repo.updatePassword(userId, await hashPassword(newPassword));
  logger.info("Account password changed", { userId });
}

export async function updateAddress(
  userId: string,
  input: AddressInput,
): Promise<void> {
  const repo = await getUserRepository();
  await repo.updateAddress(userId, {
    name: input.name,
    phone: input.phone,
    address: input.address,
  });
}
