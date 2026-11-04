import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import {
  getContentRepository,
  type ContentRepository,
} from "@/server/repositories/content.repository";
import { notFound, serviceUnavailable, type ServiceResult } from "@/types/api";
import { aboutPageFallback, heroFallback, promoBannerFallback } from "./seed";
import {
  aboutPageSchema,
  heroDataSchema,
  promoBannerSchema,
  validateSectionData,
  type SectionUpsertInput,
} from "./schema";
import type {
  AboutPageContent,
  ContentSection,
  HeroContent,
  PromoBannerContent,
} from "./types";

export const HERO_KEY = "home.hero";
export const ABOUT_KEY = "about.page";
const tagFor = (key: string) => `content:${key}`;

/** Published section by key, with a seeded hero when nothing is stored. */
export async function getPublishedSection(key: string): Promise<ContentSection | null> {
  "use cache";
  cacheTag(tagFor(key));
  cacheLife("hours");
  const repo = await getContentRepository();
  const section = repo ? await repo.get(key, false) : null;
  if (section) return section;
  if (key === HERO_KEY) {
    return { key, type: "hero", status: "published", data: heroFallback, version: 0, updatedAt: "" };
  }
  return null;
}

/** Hero data for the storefront — validates stored data, falls back to seed. */
export async function getHeroContent(): Promise<HeroContent> {
  "use cache";
  cacheTag(tagFor(HERO_KEY));
  cacheLife("hours");
  const repo = await getContentRepository();
  const section = repo ? await repo.get(HERO_KEY, false) : null;
  const parsed = heroDataSchema.safeParse(section?.data);
  return parsed.success ? parsed.data : heroFallback;
}

/** Promo banner data for a key — validates stored data, falls back to seed. */
export async function getPromoBanner(key: string): Promise<PromoBannerContent> {
  "use cache";
  cacheTag(tagFor(key));
  cacheLife("hours");
  const repo = await getContentRepository();
  const section = repo ? await repo.get(key, false) : null;
  const parsed = promoBannerSchema.safeParse(section?.data);
  return parsed.success ? parsed.data : promoBannerFallback;
}

/** About page data — validates stored data, falls back to seed. */
export async function getAboutPage(): Promise<AboutPageContent> {
  "use cache";
  cacheTag(tagFor(ABOUT_KEY));
  cacheLife("hours");
  const repo = await getContentRepository();
  const section = repo ? await repo.get(ABOUT_KEY, false) : null;
  const parsed = aboutPageSchema.safeParse(section?.data);
  return parsed.success ? parsed.data : aboutPageFallback;
}

export async function getSectionForAdmin(
  key: string,
): Promise<ServiceResult<ContentSection>> {
  const repo = await getContentRepository();
  if (!repo) return serviceUnavailable();
  const section = await repo.get(key, true);
  return section ? { ok: true, data: section } : notFound("Section");
}

export async function upsertSection(
  key: string,
  input: SectionUpsertInput,
): Promise<ServiceResult<ContentSection>> {
  const valid = validateSectionData(input.type, input.data);
  if (!valid.ok) {
    return { ok: false, status: 400, code: "bad_request", message: valid.message };
  }
  const repo: ContentRepository | null = await getContentRepository();
  if (!repo) return serviceUnavailable();
  const section = await repo.upsert(key, input.type, input.status, valid.data);
  revalidateTag(tagFor(key), "max");
  return { ok: true, data: section };
}
