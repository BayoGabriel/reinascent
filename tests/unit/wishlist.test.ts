import { ObjectId, type Collection } from "mongodb";
import { describe, expect, it } from "vitest";

import {
  createWishlistRepository,
  type WishlistDocument,
} from "@/server/repositories/wishlist.repository";
import { wishlistSlugSchema } from "@/features/wishlist/schema";

type Filter = Record<string, unknown>;
type Update = {
  $set?: Record<string, unknown>;
  $addToSet?: Record<string, { $each?: unknown[] } | unknown>;
};

/** In-memory stand-in for the `wishlists` collection — implements just the
 *  findOne/updateOne/deleteOne surface the repository uses. */
function createFakeCollection() {
  const docs: WishlistDocument[] = [];

  const matches = (doc: WishlistDocument, filter: Filter) =>
    Object.entries(filter).every(
      ([key, value]) =>
        (doc as unknown as Filter)[key] === value ||
        (key === "_id" &&
          value instanceof ObjectId &&
          doc._id.equals(value)),
    );

  const applyUpdate = (doc: WishlistDocument, update: Update) => {
    if (update.$set) Object.assign(doc, update.$set);
    if (update.$addToSet) {
      for (const [key, raw] of Object.entries(update.$addToSet)) {
        const list = ((doc as unknown as Filter)[key] ??= []) as unknown[];
        const incoming: unknown[] =
          raw !== null && typeof raw === "object" && "$each" in raw
            ? ((raw as { $each?: unknown[] }).$each ?? [])
            : [raw];
        for (const item of incoming) {
          if (!list.includes(item)) list.push(item);
        }
      }
    }
  };

  const collection = {
    docs,
    async findOne(filter: Filter) {
      return docs.find((d) => matches(d, filter)) ?? null;
    },
    async updateOne(filter: Filter, update: Update, options?: { upsert?: boolean }) {
      let doc = docs.find((d) => matches(d, filter));
      if (!doc) {
        if (!options?.upsert) return { modifiedCount: 0 };
        doc = {
          _id: new ObjectId(),
          slugs: [],
          updatedAt: new Date(),
          ...filter,
        } as WishlistDocument;
        docs.push(doc);
      }
      applyUpdate(doc, update);
      return { modifiedCount: 1 };
    },
    async deleteOne(filter: Filter) {
      const index = docs.findIndex((d) => matches(d, filter));
      if (index === -1) return { deletedCount: 0 };
      docs.splice(index, 1);
      return { deletedCount: 1 };
    },
  };

  return collection as unknown as Collection<WishlistDocument> & {
    docs: WishlistDocument[];
  };
}

describe("wishlist repository", () => {
  it("keeps guest-token and user-owned lists independent", async () => {
    const repo = createWishlistRepository(createFakeCollection());
    await repo.saveSlugs({ token: "t1" }, ["amber-oud"]);
    await repo.saveSlugs({ userId: "u1" }, ["rose-musk"]);

    expect(await repo.getSlugs({ token: "t1" })).toEqual(["amber-oud"]);
    expect(await repo.getSlugs({ userId: "u1" })).toEqual(["rose-musk"]);
  });

  it("returns an empty list for unknown owners", async () => {
    const repo = createWishlistRepository(createFakeCollection());
    expect(await repo.getSlugs({ token: "nobody" })).toEqual([]);
  });

  it("claims a guest list into an empty account list", async () => {
    const collection = createFakeCollection();
    const repo = createWishlistRepository(collection);
    await repo.saveSlugs({ token: "guest-1" }, ["amber-oud", "rose-musk"]);

    await repo.claimGuestWishlist("guest-1", "user-1");

    expect(await repo.getSlugs({ userId: "user-1" })).toEqual([
      "amber-oud",
      "rose-musk",
    ]);
    expect(collection.docs.find((d) => d.token === "guest-1")).toBeUndefined();
  });

  it("unions a guest list into an existing account list without duplicates", async () => {
    const collection = createFakeCollection();
    const repo = createWishlistRepository(collection);
    await repo.saveSlugs({ userId: "user-1" }, ["saffron-oud"]);
    await repo.saveSlugs({ token: "guest-1" }, ["amber-oud", "saffron-oud"]);

    await repo.claimGuestWishlist("guest-1", "user-1");

    expect(await repo.getSlugs({ userId: "user-1" })).toEqual([
      "saffron-oud",
      "amber-oud",
    ]);
    expect(collection.docs).toHaveLength(1);
  });

  it("drops an empty guest list without creating an account doc", async () => {
    const collection = createFakeCollection();
    const repo = createWishlistRepository(collection);
    collection.docs.push({
      _id: new ObjectId(),
      token: "guest-1",
      slugs: [],
      updatedAt: new Date(),
    });

    await repo.claimGuestWishlist("guest-1", "user-1");

    expect(collection.docs).toHaveLength(0);
  });

  it("no-ops when there is no guest list to claim", async () => {
    const collection = createFakeCollection();
    const repo = createWishlistRepository(collection);

    await repo.claimGuestWishlist("missing", "user-1");

    expect(collection.docs).toHaveLength(0);
  });
});

describe("wishlist slug schema", () => {
  it("accepts catalog slugs", () => {
    expect(wishlistSlugSchema.safeParse("amber-oud").success).toBe(true);
  });

  it("rejects malformed slugs", () => {
    expect(wishlistSlugSchema.safeParse("").success).toBe(false);
    expect(wishlistSlugSchema.safeParse("Not A Slug!").success).toBe(false);
    expect(wishlistSlugSchema.safeParse(42).success).toBe(false);
  });
});
