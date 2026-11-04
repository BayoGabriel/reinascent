import "server-only";

import type { Db } from "mongodb";
import { getDb } from "./mongodb";

/**
 * Non-throwing variant of getDb(): returns null when env/driver/database are
 * unavailable so storefront reads can fall back to seeded content instead of
 * failing the request.
 */
export async function tryGetDb(): Promise<Db | null> {
  try {
    return await getDb();
  } catch {
    return null;
  }
}
