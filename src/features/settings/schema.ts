import { z } from "zod";

const safeHref = z
  .string()
  .trim()
  .min(1)
  .max(300)
  .refine((v) => v.startsWith("/") || /^https:\/\/[^\s]+$/i.test(v), {
    error: "href must be a site path or an https:// URL",
  });

export const siteSettingsSchema = z.object({
  brand: z
    .object({
      name: z.string().trim().min(1).max(60),
      tagline: z.string().trim().max(120).default(""),
      logoUrl: z.string().trim().max(1000).default(""),
    })
    .default({ name: "Raina Scents", tagline: "", logoUrl: "" }),
  navLinks: z
    .array(z.object({ label: z.string().trim().min(1).max(40), href: safeHref }))
    .max(8)
    .default([]),
  cta: z
    .object({ label: z.string().trim().min(1).max(40), href: safeHref })
    .default({ label: "Shop Now", href: "/products" }),
  footer: z
    .object({
      tagline: z.string().trim().max(200).default(""),
      columns: z
        .array(
          z.object({
            title: z.string().trim().min(1).max(40),
            links: z
              .array(
                z.object({
                  label: z.string().trim().min(1).max(40),
                  href: safeHref,
                  badge: z.string().trim().max(20).default(""),
                }),
              )
              .max(8)
              .default([]),
          }),
        )
        .max(6)
        .default([]),
      social: z
        .array(
          z.object({
            network: z.enum([
              "twitter",
              "linkedin",
              "facebook",
              "instagram",
              "github",
              "dribbble",
            ]),
            href: safeHref,
          }),
        )
        .max(8)
        .default([]),
    })
    .default({ tagline: "", columns: [], social: [] }),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
