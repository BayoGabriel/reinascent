import { z } from "zod";

const imageSchema = z.object({
  url: z.string().trim().min(1).max(1000),
  alt: z.string().trim().max(200).default(""),
});

const reviewSchema = z.object({
  author: z.string().trim().min(1).max(80),
  role: z.string().trim().max(80).default(""),
  rating: z.number().min(1).max(5),
  date: z.string().trim().max(40).default(""),
  text: z.string().trim().max(1000).default(""),
  avatarUrl: z.string().trim().max(1000).default(""),
  userId: z.string().trim().max(80).optional(),
  title: z.string().trim().max(120).optional(),
  photoIds: z.array(z.string().trim().max(40)).max(4).optional(),
});

/** Customer review submission (Rate This Product form). */
export const reviewSubmissionSchema = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid product slug"),
  rating: z.number().int().min(1, "Choose a star rating.").max(5),
  title: z.string().trim().min(1, "Title is required.").max(120),
  body: z.string().trim().min(1, "Description is required.").max(1000),
});

export type ReviewSubmission = z.infer<typeof reviewSubmissionSchema>;

export const productUpsertSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "slug must be lowercase-kebab-case"),
  name: z.string().trim().min(1).max(120),
  tagline: z.string().trim().max(200).default(""),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).nullable().default(null),
  badge: z.string().trim().max(40).default(""),
  description: z.string().trim().max(2000).default(""),
  sizes: z.array(z.string().trim().min(1).max(40)).max(8).default([]),
  images: z.array(imageSchema).min(1).max(10),
  ratingValue: z.number().min(0).max(5).default(0),
  ratingCount: z.number().int().min(0).default(0),
  reviews: z.array(reviewSchema).max(20).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const productUpdateSchema = productUpsertSchema.partial();

export type ProductInput = z.infer<typeof productUpsertSchema>;
export type ProductUpdate = z.infer<typeof productUpdateSchema>;
