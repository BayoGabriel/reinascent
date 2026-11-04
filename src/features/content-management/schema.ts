import { z } from "zod";
import { SECTION_TYPES, type SectionType } from "./types";

const safeHref = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .refine((v) => v.startsWith("/") || /^https:\/\/[^\s]+$/i.test(v), {
    error: "href must be a site path or an https:// URL",
  });

const heroTagSchema = z.object({
  label: z.string().trim().max(60).default(""),
  value: z.string().trim().max(16).default(""),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
});

const heroSlideSchema = z.object({
  id: z.string().trim().min(1).max(40),
  eyebrow: z.string().trim().max(80).default(""),
  heading: z.string().trim().min(1).max(120),
  subheading: z.string().trim().max(300).default(""),
  imageUrl: z.string().trim().min(1).max(1000),
  alt: z.string().trim().max(200).default(""),
  align: z.enum(["split", "left", "center"]).default("left"),
  headingFont: z.enum(["serif", "sans"]).default("serif"),
  tags: z.array(heroTagSchema).max(6).default([]),
  chips: z
    .array(
      z.object({
        productSlug: z.string().trim().min(1).max(120),
        blurb: z.string().trim().max(200).default(""),
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
      }),
    )
    .max(4)
    .default([]),
  featuredProductSlug: z.string().trim().max(120).default(""),
  productBlurb: z.string().trim().max(200).default(""),
  testimonial: z
    .object({
      name: z.string().trim().min(1).max(80),
      role: z.string().trim().max(80).default(""),
      avatarUrl: z.string().trim().max(1000).default(""),
      ctaLabel: z.string().trim().max(40).default(""),
      href: safeHref.default("/products"),
    })
    .nullable()
    .default(null),
  cta: z
    .object({ label: z.string().trim().min(1).max(40), href: safeHref })
    .nullable()
    .default(null),
});

export const heroDataSchema = z.object({
  slides: z.array(heroSlideSchema).min(1).max(6),
});

export const promoBannerSchema = z.object({
  eyebrow: z.string().trim().min(1).max(60),
  lines: z.array(z.string().trim().min(1).max(120)).min(1).max(4),
  cta: z.object({ label: z.string().trim().min(1).max(40), href: safeHref }),
  discountText: z.string().trim().min(1).max(20),
  productSlug: z.string().trim().max(120).default(""),
  imageUrl: z.string().trim().max(1000).default(""),
  alt: z.string().trim().max(200).default(""),
});

const aboutItemSchema = z.object({
  title: z.string().trim().min(1).max(60),
  body: z.string().trim().max(400).default(""),
});

export const aboutPageSchema = z.object({
  heading: z.string().trim().min(1).max(120),
  subheading: z.string().trim().max(300).default(""),
  tiles: z
    .array(
      z.object({
        title: z.string().trim().min(1).max(80),
        body: z.string().trim().max(400).default(""),
        imageUrl: z.string().trim().min(1).max(1000),
        alt: z.string().trim().max(200).default(""),
        tone: z.enum(["cream", "sky", "pink"]).default("cream"),
      }),
    )
    .max(6)
    .default([]),
  valuesHeading: z.string().trim().max(80).default(""),
  values: z.array(aboutItemSchema).max(8).default([]),
  why: z.object({
    eyebrow: z.string().trim().max(40).default(""),
    heading: z.string().trim().min(1).max(120),
    body: z.string().trim().max(400).default(""),
    imageUrl: z.string().trim().max(1000).default(""),
    alt: z.string().trim().max(200).default(""),
    items: z.array(aboutItemSchema).max(6).default([]),
  }),
});

export const sectionUpsertSchema = z.object({
  type: z.enum(SECTION_TYPES),
  status: z.enum(["draft", "published"]).default("published"),
  data: z.unknown(),
});

export type SectionUpsertInput = z.infer<typeof sectionUpsertSchema>;

/** Validate `data` against the schema approved for a section type. */
export function validateSectionData(
  type: SectionType,
  data: unknown,
): { ok: true; data: unknown } | { ok: false; message: string } {
  if (type === "hero") {
    const parsed = heroDataSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid hero data" };
    }
    return { ok: true, data: parsed.data };
  }
  if (type === "promo_banner") {
    const parsed = promoBannerSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid banner data" };
    }
    return { ok: true, data: parsed.data };
  }
  if (type === "about_page") {
    const parsed = aboutPageSchema.safeParse(data);
    if (!parsed.success) {
      return { ok: false, message: parsed.error.issues[0]?.message ?? "Invalid about page data" };
    }
    return { ok: true, data: parsed.data };
  }
  if (typeof data !== "object" || data === null) {
    return { ok: false, message: "Section data must be an object" };
  }
  return { ok: true, data };
}
