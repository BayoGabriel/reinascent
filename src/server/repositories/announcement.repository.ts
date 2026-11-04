import "server-only";

import { ObjectId, type Collection, type OptionalUnlessRequiredId } from "mongodb";

import { tryGetDb } from "@/server/db/optional";
import type {
  Announcement,
  AnnouncementIcon,
  AnnouncementVariant,
} from "@/features/announcements/types";
import type {
  AnnouncementInput,
  AnnouncementUpdate,
} from "@/features/announcements/schema";

const COLLECTION = "announcements";

export interface AnnouncementDocument {
  _id: ObjectId;
  text: string;
  href: string | null;
  variant: AnnouncementVariant;
  icon: AnnouncementIcon;
  isActive: boolean;
  order: number;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function iso(value: Date | null | undefined): string | null {
  return value ? new Date(value).toISOString() : null;
}

function toAnnouncement(doc: AnnouncementDocument): Announcement {
  return {
    id: doc._id.toHexString(),
    text: doc.text,
    href: doc.href,
    variant: doc.variant,
    icon: doc.icon,
    isActive: doc.isActive,
    order: doc.order,
    startsAt: iso(doc.startsAt),
    endsAt: iso(doc.endsAt),
    createdAt: iso(doc.createdAt) ?? "",
    updatedAt: iso(doc.updatedAt) ?? "",
  };
}

export interface AnnouncementRepository {
  findActive(): Promise<Announcement[]>;
  listAll(): Promise<Announcement[]>;
  create(input: AnnouncementInput): Promise<Announcement>;
  update(id: string, patch: AnnouncementUpdate): Promise<Announcement | null>;
  remove(id: string): Promise<boolean>;
}

export function createAnnouncementRepository(
  collection: Collection<AnnouncementDocument>,
): AnnouncementRepository {
  return {
    async findActive() {
      const docs = await collection
        .find({ isActive: true })
        .sort({ order: 1, createdAt: 1 })
        .limit(50)
        .toArray();
      return docs.map(toAnnouncement);
    },
    async listAll() {
      const docs = await collection
        .find()
        .sort({ order: 1, createdAt: 1 })
        .limit(200)
        .toArray();
      return docs.map(toAnnouncement);
    },
    async create(input) {
      const now = new Date();
      const doc = {
        ...input,
        href: input.href ?? null,
        startsAt: input.startsAt ? new Date(input.startsAt) : null,
        endsAt: input.endsAt ? new Date(input.endsAt) : null,
        createdAt: now,
        updatedAt: now,
      };
      const res = await collection.insertOne(
        doc as OptionalUnlessRequiredId<AnnouncementDocument>,
      );
      return toAnnouncement({ ...doc, _id: res.insertedId });
    },
    async update(id, patch) {
      if (!ObjectId.isValid(id)) return null;
      const set: Record<string, unknown> = { ...patch, updatedAt: new Date() };
      if ("startsAt" in patch) set.startsAt = patch.startsAt ? new Date(patch.startsAt) : null;
      if ("endsAt" in patch) set.endsAt = patch.endsAt ? new Date(patch.endsAt) : null;
      for (const k of Object.keys(set)) if (set[k] === undefined) delete set[k];
      const res = await collection.updateOne({ _id: new ObjectId(id) }, { $set: set });
      if (!res.matchedCount) return null;
      const doc = await collection.findOne({ _id: new ObjectId(id) });
      return doc ? toAnnouncement(doc) : null;
    },
    async remove(id) {
      if (!ObjectId.isValid(id)) return false;
      const res = await collection.deleteOne({ _id: new ObjectId(id) });
      return res.deletedCount > 0;
    },
  };
}

let indexReady: Promise<unknown> | null = null;

/** Null when the database is unavailable — callers fall back to seeds/503. */
export async function getAnnouncementRepository(): Promise<AnnouncementRepository | null> {
  const db = await tryGetDb();
  if (!db) return null;
  const collection = db.collection<AnnouncementDocument>(COLLECTION);
  indexReady ??= collection.createIndex({ isActive: 1, order: 1 }).catch(() => "");
  return createAnnouncementRepository(collection);
}
