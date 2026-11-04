import "server-only";

import {
  ObjectId,
  type Collection,
  type Document,
  type OptionalUnlessRequiredId,
} from "mongodb";

import { tryGetDb } from "@/server/db/optional";
import type { Product, ProductImage, ProductReview } from "@/features/products/types";
import type { ProductInput, ProductUpdate } from "@/features/products/schema";

const COLLECTION = "products";

export interface ProductDocument {
  _id: ObjectId;
  slug: string;
  name: string;
  tagline: string;
  price: number;
  compareAtPrice: number | null;
  badge: string;
  description: string;
  sizes: string[];
  images: ProductImage[];
  ratingValue: number;
  ratingCount: number;
  reviews: ProductReview[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

function toProduct(doc: ProductDocument): Product {
  return {
    id: doc._id.toHexString(),
    slug: doc.slug,
    name: doc.name,
    tagline: doc.tagline,
    price: doc.price,
    compareAtPrice: doc.compareAtPrice,
    badge: doc.badge,
    description: doc.description,
    sizes: doc.sizes,
    images: doc.images,
    ratingValue: doc.ratingValue,
    ratingCount: doc.ratingCount,
    reviews: doc.reviews,
    isActive: doc.isActive,
    isFeatured: doc.isFeatured,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : "",
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
  };
}

export interface ProductRepository {
  listActive(limit?: number): Promise<Product[]>;
  listFeatured(limit?: number): Promise<Product[]>;
  listNewest(limit?: number): Promise<Product[]>;
  listOnSale(limit?: number): Promise<Product[]>;
  findBySlug(slug: string): Promise<Product | null>;
  findBySlugs(slugs: string[]): Promise<Product[]>;
  listAll(limit?: number): Promise<Product[]>;
  countAll(): Promise<number>;
  create(input: ProductInput): Promise<Product>;
  update(id: string, patch: ProductUpdate): Promise<Product | null>;
  remove(id: string): Promise<boolean>;
  /**
   * Push a customer review and fold its rating into the rolling average in a
   * single atomic update. The `reviews.userId != review.userId` filter makes
   * duplicate submissions a no-op ("duplicate"), one review per user.
   */
  appendReview(
    slug: string,
    review: ProductReview,
  ): Promise<"added" | "duplicate" | "missing">;
}

export function createProductRepository(
  collection: Collection<ProductDocument>,
): ProductRepository {
  return {
    async listActive(limit = 60) {
      const docs = await collection
        .find({ isActive: true })
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(limit)
        .toArray();
      return docs.map(toProduct);
    },
    async listFeatured(limit = 8) {
      const docs = await collection
        .find({ isActive: true, isFeatured: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      return docs.map(toProduct);
    },
    async listNewest(limit = 8) {
      const docs = await collection
        .find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      return docs.map(toProduct);
    },
    async listOnSale(limit = 60) {
      const docs = await collection
        .find({
          isActive: true,
          $or: [{ badge: "Sale" }, { compareAtPrice: { $ne: null } }],
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      return docs.map(toProduct);
    },
    async findBySlug(slug) {
      const doc = await collection.findOne({ slug, isActive: true });
      return doc ? toProduct(doc) : null;
    },
    async findBySlugs(slugs) {
      if (!slugs.length) return [];
      const docs = await collection
        .find({ slug: { $in: slugs }, isActive: true })
        .toArray();
      const bySlug = new Map(docs.map((d) => [d.slug, toProduct(d)]));
      return slugs.flatMap((s) => (bySlug.has(s) ? [bySlug.get(s)!] : []));
    },
    async listAll(limit = 200) {
      const docs = await collection
        .find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      return docs.map(toProduct);
    },
    async countAll() {
      return collection.countDocuments();
    },
    async remove(id) {
      if (!ObjectId.isValid(id)) return false;
      const res = await collection.deleteOne({ _id: new ObjectId(id) });
      return res.deletedCount > 0;
    },
    async create(input) {
      const now = new Date();
      const doc = { ...input, createdAt: now, updatedAt: now };
      const res = await collection.insertOne(
        doc as OptionalUnlessRequiredId<ProductDocument>,
      );
      return toProduct({ ...doc, _id: res.insertedId });
    },
    async update(id, patch) {
      if (!ObjectId.isValid(id)) return null;
      const res = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...patch, updatedAt: new Date() } },
      );
      if (!res.matchedCount) return null;
      const doc = await collection.findOne({ _id: new ObjectId(id) });
      return doc ? toProduct(doc) : null;
    },
    async appendReview(slug, review) {
      const pipeline: Document[] = [
        {
          $set: {
            reviews: { $concatArrays: ["$reviews", [review]] },
            ratingCount: { $add: ["$ratingCount", 1] },
            ratingValue: {
              $round: [
                {
                  $divide: [
                    {
                      $add: [
                        { $multiply: ["$ratingValue", "$ratingCount"] },
                        review.rating,
                      ],
                    },
                    { $add: ["$ratingCount", 1] },
                  ],
                },
                1,
              ],
            },
            updatedAt: "$$NOW",
          },
        },
      ];
      const res = await collection.updateOne(
        { slug, isActive: true, "reviews.userId": { $ne: review.userId } },
        pipeline,
      );
      if (res.matchedCount) return "added";
      const doc = await collection.findOne(
        { slug, isActive: true },
        { projection: { _id: 1 } },
      );
      return doc ? "duplicate" : "missing";
    },
  };
}

let indexReady: Promise<unknown> | null = null;

/** Null when the database is unavailable — callers fall back to seeds/503. */
export async function getProductRepository(): Promise<ProductRepository | null> {
  const db = await tryGetDb();
  if (!db) return null;
  const collection = db.collection<ProductDocument>(COLLECTION);
  indexReady ??= Promise.all([
    collection.createIndex({ slug: 1 }, { unique: true }),
    collection.createIndex({ isActive: 1, isFeatured: -1 }),
  ]).catch(() => "");
  return createProductRepository(collection);
}
