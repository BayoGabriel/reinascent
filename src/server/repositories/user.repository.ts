import "server-only";

import { ObjectId, type Collection, type OptionalUnlessRequiredId } from "mongodb";

import { getDb } from "@/server/db/mongodb";
import type { Role } from "@/config/permissions";

export type UserStatus = "active" | "suspended";

/** Saved shipping address shown on the account Address screen. */
export interface UserAddress {
  name: string;
  phone: string;
  address: string;
}

/** Shape of the `users` collection document. */
export interface UserDocument {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  shippingAddress?: UserAddress;
  roles: Role[];
  status: UserStatus;
  mustChangePassword?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** User record safe to return to callers; never contains the hash. */
export type PublicUser = Omit<UserDocument, "passwordHash">;

/** Explicit writable fields; prevents mass assignment. */
export interface NewUser {
  email: string;
  passwordHash: string;
  displayName: string;
  roles: Role[];
  mustChangePassword?: boolean;
}

export class DuplicateEmailError extends Error {
  constructor() {
    super("A user with this email already exists");
    this.name = "DuplicateEmailError";
  }
}

/** Writable profile fields from the Account Details screen. */
export interface ProfilePatch {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
}

export interface UserRepository {
  ensureIndexes(): Promise<void>;
  findByEmail(email: string): Promise<PublicUser | null>;
  /** Includes the password hash; for credential verification only. */
  findCredentialsByEmail(
    email: string,
  ): Promise<Pick<UserDocument, "_id" | "passwordHash" | "status"> | null>;
  /** Credentials for the signed-in user; backs password changes. */
  findCredentialsById(
    id: string,
  ): Promise<Pick<UserDocument, "_id" | "passwordHash" | "status"> | null>;
  findById(id: string): Promise<PublicUser | null>;
  create(user: NewUser): Promise<PublicUser>;
  updateProfile(id: string, patch: ProfilePatch): Promise<PublicUser | null>;
  updateAddress(id: string, address: UserAddress): Promise<PublicUser | null>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  /** Admin customer listing, newest first. */
  listAll(limit: number, skip: number): Promise<PublicUser[]>;
  countAll(): Promise<number>;
  setStatus(id: string, status: UserStatus): Promise<boolean>;
  setRoles(id: string, roles: Role[]): Promise<boolean>;
}

const COLLECTION = "users";
const MONGO_DUPLICATE_KEY = 11000;

function toPublic(doc: UserDocument): PublicUser {
  const { passwordHash, ...rest } = doc;
  void passwordHash;
  return rest;
}

export function createUserRepository(
  collection: Collection<UserDocument>,
): UserRepository {
  return {
    async ensureIndexes() {
      await collection.createIndex({ email: 1 }, { unique: true });
    },

    async findByEmail(email) {
      const doc = await collection.findOne({ email });
      return doc ? toPublic(doc) : null;
    },

    async findCredentialsByEmail(email) {
      return collection.findOne(
        { email },
        { projection: { passwordHash: 1, status: 1 } },
      );
    },

    async findCredentialsById(id) {
      if (!ObjectId.isValid(id)) return null;
      return collection.findOne(
        { _id: new ObjectId(id) },
        { projection: { passwordHash: 1, status: 1 } },
      );
    },

    async findById(id) {
      if (!ObjectId.isValid(id)) return null;
      const doc = await collection.findOne({ _id: new ObjectId(id) });
      return doc ? toPublic(doc) : null;
    },

    async create(user) {
      const now = new Date();
      const doc = {
        ...user,
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      };
      try {
        const result = await collection.insertOne(
          doc as OptionalUnlessRequiredId<UserDocument>,
        );
        return toPublic({ ...doc, _id: result.insertedId });
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === MONGO_DUPLICATE_KEY
        ) {
          throw new DuplicateEmailError();
        }
        throw error;
      }
    },

    async updateProfile(id, patch) {
      if (!ObjectId.isValid(id)) return null;
      try {
        const doc = await collection.findOneAndUpdate(
          { _id: new ObjectId(id) },
          { $set: { ...patch, updatedAt: new Date() } },
          { returnDocument: "after" },
        );
        return doc ? toPublic(doc) : null;
      } catch (error) {
        if (
          error instanceof Error &&
          "code" in error &&
          error.code === MONGO_DUPLICATE_KEY
        ) {
          throw new DuplicateEmailError();
        }
        throw error;
      }
    },

    async updateAddress(id, address) {
      if (!ObjectId.isValid(id)) return null;
      const doc = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { shippingAddress: address, updatedAt: new Date() } },
        { returnDocument: "after" },
      );
      return doc ? toPublic(doc) : null;
    },

    async updatePassword(id, passwordHash) {
      if (!ObjectId.isValid(id)) return;
      await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: { passwordHash, updatedAt: new Date() },
          $unset: { mustChangePassword: "" },
        },
      );
    },

    async listAll(limit, skip) {
      const docs = await collection
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
      return docs.map(toPublic);
    },

    async countAll() {
      return collection.countDocuments();
    },

    async setStatus(id, status) {
      if (!ObjectId.isValid(id)) return false;
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } },
      );
      return result.modifiedCount === 1;
    },

    async setRoles(id, roles) {
      if (!ObjectId.isValid(id)) return false;
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { roles, updatedAt: new Date() } },
      );
      return result.modifiedCount === 1;
    },
  };
}

let cachedRepo: Promise<UserRepository> | null = null;

export function getUserRepository(): Promise<UserRepository> {
  if (!cachedRepo) {
    cachedRepo = getDb().then(async (db) => {
      const repo = createUserRepository(
        db.collection<UserDocument>(COLLECTION),
      );
      await repo.ensureIndexes();
      return repo;
    });
  }
  return cachedRepo;
}
