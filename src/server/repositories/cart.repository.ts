import "server-only";

import { ObjectId, type Collection } from "mongodb";

import { tryGetDb } from "@/server/db/optional";
import type { StoredCartItem } from "@/features/cart/types";

const COLLECTION = "carts";

export interface CartDocument {
  _id: ObjectId;
  /** ske_guest token; may later carry a userId alongside it. */
  token: string;
  items: StoredCartItem[];
  updatedAt: Date;
}

export interface CartRepository {
  getItems(token: string): Promise<StoredCartItem[]>;
  saveItems(token: string, items: StoredCartItem[]): Promise<void>;
}

export function createCartRepository(
  collection: Collection<CartDocument>,
): CartRepository {
  return {
    async getItems(token) {
      const doc = await collection.findOne({ token });
      return doc?.items ?? [];
    },
    async saveItems(token, items) {
      await collection.updateOne(
        { token },
        { $set: { items, updatedAt: new Date() } },
        { upsert: true },
      );
    },
  };
}

let indexReady: Promise<unknown> | null = null;

/** Null when the database is unavailable — cart mutations no-op, reads empty. */
export async function getCartRepository(): Promise<CartRepository | null> {
  const db = await tryGetDb();
  if (!db) return null;
  const collection = db.collection<CartDocument>(COLLECTION);
  indexReady ??= collection.createIndex({ token: 1 }, { unique: true }).catch(() => "");
  return createCartRepository(collection);
}
