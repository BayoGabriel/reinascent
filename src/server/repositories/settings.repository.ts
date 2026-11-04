import "server-only";

import { ObjectId, type Collection } from "mongodb";

import { tryGetDb } from "@/server/db/optional";
import type { FooterContent, SiteSettings } from "@/features/settings/types";
import type { SiteSettingsInput } from "@/features/settings/schema";
import { settingsFallback } from "@/features/settings/seed";

const COLLECTION = "site_settings";
const KEY = "main";

interface SettingsDocument {
  _id: ObjectId;
  key: string;
  brand: { name: string; tagline: string; logoUrl: string };
  navLinks: { label: string; href: string }[];
  cta?: { label: string; href: string };
  footer?: FooterContent;
  updatedAt: Date;
}

function toSettings(doc: SettingsDocument): SiteSettings {
  return {
    brand: doc.brand,
    navLinks: doc.navLinks ?? [],
    cta: doc.cta ?? { label: "Shop Now", href: "/products" },
    footer: doc.footer ?? settingsFallback.footer,
  };
}

export interface SettingsRepository {
  get(): Promise<SiteSettings | null>;
  save(input: SiteSettingsInput): Promise<SiteSettings>;
}

export function createSettingsRepository(
  collection: Collection<SettingsDocument>,
): SettingsRepository {
  return {
    async get() {
      const doc = await collection.findOne({ key: KEY });
      return doc ? toSettings(doc) : null;
    },
    async save(input) {
      await collection.updateOne(
        { key: KEY },
        { $set: { ...input, updatedAt: new Date() } },
        { upsert: true },
      );
      const doc = await collection.findOne({ key: KEY });
      if (!doc) throw new Error("Settings upsert failed to read back");
      return toSettings(doc);
    },
  };
}

let indexReady: Promise<unknown> | null = null;

/** Null when the database is unavailable. */
export async function getSettingsRepository(): Promise<SettingsRepository | null> {
  const db = await tryGetDb();
  if (!db) return null;
  const collection = db.collection<SettingsDocument>(COLLECTION);
  indexReady ??= collection.createIndex({ key: 1 }, { unique: true }).catch(() => "");
  return createSettingsRepository(collection);
}
