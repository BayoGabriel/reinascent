/**
 * Storefront content bootstrap (npm run content:seed).
 *
 * Inserts starter announcements, products, the homepage hero slideshow, and
 * site settings when each collection is still empty — admin edits to those
 * collections are never overwritten. The homepage hero is seed-managed for
 * now (no admin UI yet): home.hero is rewritten whenever its stored data
 * differs from the current fallback slides, and site settings are migrated
 * off the retired MAAB brand defaults.
 *
 * Run with the react-server condition so "server-only" modules resolve:
 *   node --conditions=react-server --import tsx scripts/seed-content.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: [".env.local", ".env"], quiet: true });

import { getDb, getMongoClient } from "@/server/db/mongodb";
import { heroDataSchema } from "@/features/content-management/schema";
import { heroFallback, promoBannerFallback, aboutPageFallback } from "@/features/content-management/seed";
import { fallbackAnnouncements } from "@/features/announcements/seed";
import { fallbackProducts } from "@/features/products/seed";
import { settingsFallback } from "@/features/settings/seed";

async function main(): Promise<number> {
  const db = await getDb();
  const now = new Date();

  const announcements = db.collection("announcements");
  await announcements.createIndex({ isActive: 1, order: 1 });
  if ((await announcements.countDocuments()) === 0) {
    await announcements.insertMany(
      fallbackAnnouncements.map((a) => ({
        text: a.text,
        href: a.href,
        variant: a.variant,
        icon: a.icon,
        isActive: a.isActive,
        order: a.order,
        startsAt: null,
        endsAt: null,
        createdAt: now,
        updatedAt: now,
      })),
    );
    console.log(`Inserted ${fallbackAnnouncements.length} announcements.`);
  } else {
    console.log("Announcements already exist. No changes made.");
  }

  const products = db.collection("products");
  await products.createIndex({ slug: 1 }, { unique: true });
  await products.createIndex({ isActive: 1, isFeatured: -1 });
  if ((await products.countDocuments()) === 0) {
    await products.insertMany(
      fallbackProducts.map((p) => ({ ...p, createdAt: now, updatedAt: now })),
    );
    console.log(`Inserted ${fallbackProducts.length} products.`);
  } else {
    console.log("Products already exist. No changes made.");
  }

  const sections = db.collection("content_sections");
  await sections.createIndex({ key: 1 }, { unique: true });
  const hero = await sections.findOne({ key: "home.hero" });
  const heroStale =
    !hero ||
    !heroDataSchema.safeParse(hero.data).success ||
    JSON.stringify(hero.data) !== JSON.stringify(heroFallback);
  if (heroStale) {
    await sections.updateOne(
      { key: "home.hero" },
      {
        $set: {
          type: "hero",
          status: "published",
          data: heroFallback,
          updatedAt: now,
        },
        $inc: { version: 1 },
        $setOnInsert: { createdAt: now },
      },
      { upsert: true },
    );
    console.log(
      hero
        ? "Rewrote home.hero — stored data did not match the current seed."
        : "Inserted home.hero section.",
    );
  } else {
    console.log("home.hero already exists. No changes made.");
  }

  if ((await sections.countDocuments({ key: "home.flash_sale" })) === 0) {
    await sections.insertOne({
      key: "home.flash_sale",
      type: "promo_banner",
      status: "published",
      data: promoBannerFallback,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    console.log("Inserted home.flash_sale section.");
  } else {
    console.log("home.flash_sale already exists. No changes made.");
  }

  if ((await sections.countDocuments({ key: "about.page" })) === 0) {
    await sections.insertOne({
      key: "about.page",
      type: "about_page",
      status: "published",
      data: aboutPageFallback,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
    console.log("Inserted about.page section.");
  } else {
    console.log("about.page already exists. No changes made.");
  }

  const settings = db.collection("site_settings");
  await settings.createIndex({ key: 1 }, { unique: true });
  const current = await settings.findOne({ key: "main" });
  if (!current) {
    await settings.insertOne({ key: "main", ...settingsFallback, updatedAt: now });
    console.log("Inserted site settings.");
  } else if (
    current.brand?.name === "MAAB" ||
    !current.cta?.label ||
    !current.footer
  ) {
    await settings.updateOne(
      { key: "main" },
      {
        $set: {
          brand: settingsFallback.brand,
          navLinks: settingsFallback.navLinks,
          cta: settingsFallback.cta,
          footer: settingsFallback.footer,
          updatedAt: now,
        },
      },
    );
    console.log("Updated site settings to the current brand/nav defaults.");
  } else {
    console.log("Site settings already exist. No changes made.");
  }

  return 0;
}

main()
  .catch(() => {
    console.error(
      "Content seed failed. Check configuration and database connectivity.",
    );
    process.exitCode = 1;
  })
  .then(async (code) => {
    if (typeof code === "number") process.exitCode = code;
    try {
      const client = await getMongoClient();
      await client.close();
    } catch {
      // Connection may never have opened; nothing to close.
    }
  });
