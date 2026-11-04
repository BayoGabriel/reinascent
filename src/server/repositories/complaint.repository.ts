import "server-only";

import { ObjectId, type Collection } from "mongodb";

import { tryGetDb } from "@/server/db/optional";

const COLLECTION = "complaints";

export type ComplaintStatus = "open" | "solved";
export type ComplaintAuthor = "customer" | "admin";

export interface ComplaintMessage {
  author: ComplaintAuthor;
  body: string;
  createdAt: Date;
}

/** Support thread shown on the account Complaints screen. */
export interface ComplaintDocument {
  _id: ObjectId;
  userId: string;
  subject: string;
  status: ComplaintStatus;
  messages: ComplaintMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplaintRepository {
  listByUser(userId: string): Promise<ComplaintDocument[]>;
  insert(input: {
    userId: string;
    subject: string;
    body: string;
  }): Promise<ComplaintDocument>;
  /** Ownership-scoped status flip; false when the thread isn't the user's. */
  setStatus(
    userId: string,
    id: string,
    status: ComplaintStatus,
  ): Promise<boolean>;
  /** Admin inbox — every thread, newest first. */
  listAll(status: ComplaintStatus | undefined, limit: number): Promise<ComplaintDocument[]>;
  countByStatus(status: ComplaintStatus): Promise<number>;
  /** Admin reply appended to the thread. */
  addMessage(id: string, message: ComplaintMessage): Promise<boolean>;
  /** Unscoped status flip for admins (service still guards permission). */
  setStatusAny(id: string, status: ComplaintStatus): Promise<boolean>;
}

export function createComplaintRepository(
  collection: Collection<ComplaintDocument>,
): ComplaintRepository {
  return {
    async listByUser(userId) {
      return collection.find({ userId }).sort({ createdAt: -1 }).toArray();
    },

    async insert({ userId, subject, body }) {
      const now = new Date();
      const doc: ComplaintDocument = {
        _id: new ObjectId(),
        userId,
        subject,
        status: "open",
        messages: [{ author: "customer", body, createdAt: now }],
        createdAt: now,
        updatedAt: now,
      };
      await collection.insertOne(doc);
      return doc;
    },

    async setStatus(userId, id, status) {
      if (!ObjectId.isValid(id)) return false;
      const result = await collection.updateOne(
        { _id: new ObjectId(id), userId },
        { $set: { status, updatedAt: new Date() } },
      );
      return result.modifiedCount === 1;
    },

    async listAll(status, limit) {
      return collection
        .find(status ? { status } : {})
        .sort({ updatedAt: -1 })
        .limit(limit)
        .toArray();
    },

    async countByStatus(status) {
      return collection.countDocuments({ status });
    },

    async addMessage(id, message) {
      if (!ObjectId.isValid(id)) return false;
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          $push: { messages: message },
          $set: { updatedAt: new Date() },
        },
      );
      return result.modifiedCount === 1;
    },

    async setStatusAny(id, status) {
      if (!ObjectId.isValid(id)) return false;
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } },
      );
      return result.modifiedCount === 1;
    },
  };
}

let indexReady: Promise<unknown> | null = null;

/** Null when the database is unavailable — callers degrade accordingly. */
export async function getComplaintRepository(): Promise<ComplaintRepository | null> {
  const db = await tryGetDb();
  if (!db) return null;
  const collection = db.collection<ComplaintDocument>(COLLECTION);
  indexReady ??= collection
    .createIndex({ userId: 1, createdAt: -1 })
    .catch(() => "");
  return createComplaintRepository(collection);
}
