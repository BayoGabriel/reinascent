import "server-only";

import { ObjectId, type Collection } from "mongodb";

import { tryGetDb } from "@/server/db/optional";

const COLLECTION = "payment_methods";

/**
 * Tokenized card metadata ONLY. Raw PAN and CVV are never persisted — a
 * production deployment tokenizes through Paystack and stores the returned
 * `providerRef` (authorization code) instead. brand/last4/expiry are the
 * display-safe fields Paystack itself returns.
 */
export interface PaymentMethodDocument {
  _id: ObjectId;
  userId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  nameOnCard: string;
  providerRef: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewPaymentMethod {
  userId: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  nameOnCard: string;
  providerRef: string | null;
}

export interface PaymentMethodRepository {
  listByUser(userId: string): Promise<PaymentMethodDocument[]>;
  /** Insert a card; the first card a user saves becomes the default. */
  insert(card: NewPaymentMethod): Promise<PaymentMethodDocument>;
  /** Update the current default card's display fields. */
  updateDefault(
    userId: string,
    patch: Omit<NewPaymentMethod, "userId">,
  ): Promise<PaymentMethodDocument | null>;
  /** Ownership-scoped: only flips when the card belongs to the user. */
  setDefault(userId: string, id: string): Promise<boolean>;
}

export function createPaymentMethodRepository(
  collection: Collection<PaymentMethodDocument>,
): PaymentMethodRepository {
  return {
    async listByUser(userId) {
      return collection
        .find({ userId })
        .sort({ isDefault: -1, createdAt: -1 })
        .toArray();
    },

    async insert(card) {
      const now = new Date();
      const hasCards = await collection.countDocuments(
        { userId: card.userId },
        { limit: 1 },
      );
      const doc: PaymentMethodDocument = {
        ...card,
        _id: new ObjectId(),
        isDefault: hasCards === 0,
        createdAt: now,
        updatedAt: now,
      };
      await collection.insertOne(doc);
      return doc;
    },

    async updateDefault(userId, patch) {
      return collection.findOneAndUpdate(
        { userId, isDefault: true },
        { $set: { ...patch, updatedAt: new Date() } },
        { returnDocument: "after" },
      );
    },

    async setDefault(userId, id) {
      if (!ObjectId.isValid(id)) return false;
      const target = await collection.findOne({ _id: new ObjectId(id), userId });
      if (!target) return false;
      await collection.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false, updatedAt: new Date() } },
      );
      const result = await collection.updateOne(
        { _id: target._id },
        { $set: { isDefault: true, updatedAt: new Date() } },
      );
      return result.modifiedCount === 1;
    },
  };
}

let indexReady: Promise<unknown> | null = null;

/** Null when the database is unavailable — callers degrade accordingly. */
export async function getPaymentMethodRepository(): Promise<PaymentMethodRepository | null> {
  const db = await tryGetDb();
  if (!db) return null;
  const collection = db.collection<PaymentMethodDocument>(COLLECTION);
  indexReady ??= Promise.all([
    collection.createIndex({ userId: 1, isDefault: -1 }),
  ]).catch(() => "");
  return createPaymentMethodRepository(collection);
}
