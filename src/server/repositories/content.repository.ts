import "server-only";

import { ObjectId, type Collection } from "mongodb";

import { tryGetDb } from "@/server/db/optional";
import type {
  ContentSection,
  SectionStatus,
  SectionType,
} from "@/features/content-management/types";

const COLLECTION = "content_sections";

export interface SectionDocument {
  _id: ObjectId;
  key: string;
  type: SectionType;
  status: SectionStatus;
  data: unknown;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

function toSection(doc: SectionDocument): ContentSection {
  return {
    key: doc.key,
    type: doc.type,
    status: doc.status,
    data: doc.data,
    version: doc.version,
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : "",
  };
}

export interface ContentRepository {
  get(key: string, includeDrafts: boolean): Promise<ContentSection | null>;
  upsert(
    key: string,
    type: SectionType,
    status: SectionStatus,
    data: unknown,
  ): Promise<ContentSection>;
}

export function createContentRepository(
  collection: Collection<SectionDocument>,
): ContentRepository {
  return {
    async get(key, includeDrafts) {
      const doc = await collection.findOne(
        includeDrafts ? { key } : { key, status: "published" },
      );
      return doc ? toSection(doc) : null;
    },
    async upsert(key, type, status, data) {
      const now = new Date();
      await collection.updateOne(
        { key },
        {
          $set: { type, status, data, updatedAt: now },
          $inc: { version: 1 },
          $setOnInsert: { createdAt: now },
        },
        { upsert: true },
      );
      const doc = await collection.findOne({ key });
      if (!doc) throw new Error("Section upsert failed to read back");
      return toSection(doc);
    },
  };
}

let indexReady: Promise<unknown> | null = null;

/** Null when the database is unavailable. */
export async function getContentRepository(): Promise<ContentRepository | null> {
  const db = await tryGetDb();
  if (!db) return null;
  const collection = db.collection<SectionDocument>(COLLECTION);
  indexReady ??= collection.createIndex({ key: 1 }, { unique: true }).catch(() => "");
  return createContentRepository(collection);
}
