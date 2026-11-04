import type { Db } from "mongodb";

import { tryGetDb } from "./optional";

/**
 * Tolerant db accessor shared by feature slices that fall back to seeded
 * content when MongoDB is unconfigured or unreachable. Strict callers
 * (auth, users) use `@/server/db/mongodb` directly.
 */
export function resolveDb(): Promise<Db | null> {
  return tryGetDb();
}

export async function dbAvailable(): Promise<boolean> {
  return (await tryGetDb()) != null;
}
