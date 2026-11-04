import "server-only";

import { MongoClient, type Db, type MongoClientOptions } from "mongodb";

import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";

/**
 * Reusable MongoDB client. The resolved client is cached on globalThis so it
 * survives Next.js development hot reloads; a single client is shared by
 * every repository call. A resolved client is returned synchronously — never
 * as the connect promise — so `"use cache"` functions don't await a promise
 * created outside their scope. Never log the URI: it embeds credentials.
 */
declare global {
  var __sadikecomMongo: Promise<MongoClient> | undefined;
  var __sadikecomMongoClient: MongoClient | undefined;
}

const OPTIONS: MongoClientOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5_000,
};

function createClientPromise(): Promise<MongoClient> {
  const { MONGODB_URI } = getServerEnv();
  const client = new MongoClient(MONGODB_URI, OPTIONS);
  return client
    .connect()
    .then((connected) => {
      global.__sadikecomMongoClient = connected;
      global.__sadikecomMongo = undefined;
      return connected;
    })
    .catch((error: unknown) => {
      logger.error("MongoDB connection failed");
      global.__sadikecomMongo = undefined;
      throw error;
    });
}

export function getMongoClient(): Promise<MongoClient> | MongoClient {
  if (global.__sadikecomMongoClient) {
    return global.__sadikecomMongoClient;
  }
  if (!global.__sadikecomMongo) {
    global.__sadikecomMongo = createClientPromise();
  }
  return global.__sadikecomMongo;
}

export async function getDb(): Promise<Db> {
  const { MONGODB_DB } = getServerEnv();
  const client = await getMongoClient();
  return client.db(MONGODB_DB);
}

/**
 * Readiness probe used by /api/health. Returns a boolean only so callers
 * cannot leak connection details.
 */
export async function pingDatabase(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return true;
  } catch {
    logger.error("MongoDB readiness check failed");
    return false;
  }
}
