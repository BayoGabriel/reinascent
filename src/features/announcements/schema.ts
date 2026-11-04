import { z } from "zod";
import { ANNOUNCEMENT_ICONS, ANNOUNCEMENT_VARIANTS } from "./types";

/** Internal links or https URLs only — never javascript:/data: hrefs. */
const hrefSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (v) => v === "" || v.startsWith("/") || /^https:\/\/[^\s]+$/i.test(v),
    { error: "href must be a site path or an https:// URL" },
  )
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

export const announcementInputSchema = z.object({
  text: z.string().trim().min(1).max(200),
  href: hrefSchema,
  variant: z.enum(ANNOUNCEMENT_VARIANTS).default("default"),
  icon: z.enum(ANNOUNCEMENT_ICONS).default("none"),
  isActive: z.boolean().default(true),
  order: z.number().int().min(0).max(9999).default(0),
  startsAt: z.iso.datetime({ offset: true }).nullable().optional(),
  endsAt: z.iso.datetime({ offset: true }).nullable().optional(),
});

export const announcementUpdateSchema = announcementInputSchema.partial();

export type AnnouncementInput = z.infer<typeof announcementInputSchema>;
export type AnnouncementUpdate = z.infer<typeof announcementUpdateSchema>;
