import "server-only";

import { Binary, ObjectId } from "mongodb";

import { ServiceError } from "@/lib/errors";
import { MAX_REVIEW_PHOTOS } from "@/features/products/types";
import { getDb } from "@/server/db/mongodb";
import { tryGetDb } from "@/server/db/optional";

const COLLECTION = "review_photos";
const MAX_PHOTO_BYTES = 2 * 1024 * 1024; // keep total under the action body limit
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface ReviewPhotoDocument {
  _id: ObjectId;
  userId: string;
  contentType: string;
  data: Binary;
  createdAt: Date;
}

/**
 * Placeholder object storage: review photos live in a dedicated collection
 * (never inside product documents) and are served via /api/review-photos/[id].
 * Swap for object storage + object keys when a storage provider lands.
 */
export async function saveReviewPhotos(
  userId: string,
  files: File[],
): Promise<string[]> {
  if (!files.length) return [];
  if (files.length > MAX_REVIEW_PHOTOS) {
    throw new ServiceError("bad_request", `Attach up to ${MAX_REVIEW_PHOTOS} photos.`);
  }
  for (const f of files) {
    if (!ALLOWED_TYPES.has(f.type)) {
      throw new ServiceError("bad_request", "Photos must be JPEG, PNG, or WebP.");
    }
    if (f.size > MAX_PHOTO_BYTES) {
      throw new ServiceError("bad_request", "Each photo must be under 2MB.");
    }
  }
  const db = await getDb();
  const collection = db.collection<ReviewPhotoDocument>(COLLECTION);
  const ids: string[] = [];
  for (const f of files) {
    const res = await collection.insertOne({
      userId,
      contentType: f.type,
      data: new Binary(new Uint8Array(await f.arrayBuffer())),
      createdAt: new Date(),
    } as ReviewPhotoDocument);
    ids.push(res.insertedId.toHexString());
  }
  return ids;
}

export async function getReviewPhoto(
  id: string,
): Promise<{ contentType: string; data: Uint8Array } | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await tryGetDb();
  if (!db) return null;
  const doc = await db
    .collection<ReviewPhotoDocument>(COLLECTION)
    .findOne({ _id: new ObjectId(id) });
  if (!doc) return null;
  return { contentType: doc.contentType, data: doc.data.value() };
}
