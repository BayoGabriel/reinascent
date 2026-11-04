import "server-only";

import { ServiceError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import {
  DuplicateEmailError,
  getUserRepository,
  type PublicUser,
  type UserRepository,
} from "@/server/repositories/user.repository";

/**
 * Business rules for user accounts. Repositories handle MongoDB only; this
 * module owns normalization, credential checks, and bootstrap rules.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Constant-ish work factor for unknown emails so sign-in timing does not
 * reveal whether an account exists.
 */
const DUMMY_HASH =
  "$argon2id$v=19$m=19456,t=2,p=1$c2FkaWtlY29tZHVtbXlzYWx0$" +
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

export interface CredentialsResult {
  user: PublicUser;
}

export async function registerCustomer(
  input: { email: string; password: string; displayName: string },
  repo?: UserRepository,
): Promise<PublicUser> {
  const repository = repo ?? (await getUserRepository());
  const email = normalizeEmail(input.email);
  const passwordHash = await hashPassword(input.password);
  try {
    return await repository.create({
      email,
      passwordHash,
      displayName: input.displayName.trim(),
      roles: ["customer"],
    });
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      throw new ServiceError("conflict", "Registration could not be completed.", 409);
    }
    throw error;
  }
}

/**
 * Verify credentials for sign-in. Returns null for any failure; callers must
 * surface a single generic message so registration status is not leaked.
 */
export async function verifyCredentials(
  email: string,
  password: string,
  repo?: UserRepository,
): Promise<PublicUser | null> {
  const repository = repo ?? (await getUserRepository());
  const normalized = normalizeEmail(email);
  const record = await repository.findCredentialsByEmail(normalized);
  const hash = record?.passwordHash ?? DUMMY_HASH;
  const valid = await verifyPassword(password, hash);
  if (!record || !valid || record.status !== "active") {
    return null;
  }
  return repository.findById(record._id.toHexString());
}

export type BootstrapResult =
  | { outcome: "created"; email: string }
  | { outcome: "already-admin" }
  | { outcome: "refused-existing-user" };

/**
 * Create the first administrator. Safe to rerun: never overwrites an
 * existing admin password and refuses to elevate a non-admin account.
 */
export async function createInitialAdmin(
  input: { email: string; password: string; displayName: string },
  repo?: UserRepository,
): Promise<BootstrapResult> {
  const repository = repo ?? (await getUserRepository());
  const email = normalizeEmail(input.email);
  const existing = await repository.findByEmail(email);
  if (existing?.roles.includes("admin")) {
    return { outcome: "already-admin" };
  }
  if (existing) {
    logger.warn("Admin bootstrap refused: email belongs to a non-admin user");
    return { outcome: "refused-existing-user" };
  }
  const passwordHash = await hashPassword(input.password);
  try {
    await repository.create({
      email,
      passwordHash,
      displayName: input.displayName.trim(),
      roles: ["admin"],
      mustChangePassword: false,
    });
    return { outcome: "created", email };
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return { outcome: "already-admin" };
    }
    throw error;
  }
}
