import "server-only";

import { ObjectId, type Collection } from "mongodb";

import { tryGetDb } from "@/server/db/optional";

const COLLECTION = "wishlists";

/**
 * Who owns a wishlist document: an anonymous `ske_guest` token, or the hex
 * id of the customer's account once the list has been claimed at sign-in.
 */
export type WishlistOwner = { token: string } | { userId: string };

export interface WishlistDocument {
  _id: ObjectId;
  /** ske_guest token while anonymous; the doc is deleted once claimed. */
  token?: string;
  /** Owning customer's hex id after a guest list is claimed. */
  userId?: string;
  /** Product slugs in the order they were saved. */
  slugs: string[];
  updatedAt: Date;
}

export interface WishlistRepository {
  getSlugs(owner: WishlistOwner): Promise<string[]>;
  saveSlugs(owner: WishlistOwner, slugs: string[]): Promise<void>;
  /** Merge a guest's list into the account's list, then drop the guest doc.
   *  Returns true when a guest doc existed. */
  claimGuestWishlist(token: string, userId: string): Promise<boolean>;
}

export function createWishlistRepository(
  collection: Collection<WishlistDocument>,
): WishlistRepository {
  return {
    async getSlugs(owner) {
      const doc = await collection.findOne(owner);
      return doc?.slugs ?? [];
    },
    async saveSlugs(owner, slugs) {
      await collection.updateOne(
        owner,
        { $set: { slugs, updatedAt: new Date() } },
        { upsert: true },
      );
    },
    async claimGuestWishlist(token, userId) {
      const guest = await collection.findOne({ token });
      if (!guest) return false;
      if (guest.slugs.length) {
        await collection.updateOne(
          { userId },
          {
            $addToSet: { slugs: { $each: guest.slugs } },
            $set: { updatedAt: new Date() },
          },
          { upsert: true },
        );
      }
      await collection.deleteOne({ _id: guest._id });
      return true;
    },
  };
}

let indexReady: Promise<unknown> | null = null;

/** Null when the database is unavailable — mutations no-op, reads empty. */
export async function getWishlistRepository(): Promise<WishlistRepository | null> {
  const db = await tryGetDb();
  if (!db) return null;
  const collection = db.collection<WishlistDocument>(COLLECTION);
  indexReady ??= Promise.all([
    collection.createIndex(
      { token: 1 },
      { unique: true, partialFilterExpression: { token: { $exists: true } } },
    ),
    collection.createIndex(
      { userId: 1 },
      { unique: true, partialFilterExpression: { userId: { $exists: true } } },
    ),
  ]).catch(() => "");
  return createWishlistRepository(collection);
}
