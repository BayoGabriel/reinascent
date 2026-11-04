import { z } from "zod";

export const cartItemInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid product slug"),
  size: z.string().trim().max(40).default(""),
  qty: z.number().int().min(1).max(99).default(1),
});

export const cartQtySchema = z.object({
  slug: z.string().trim().min(1).max(120),
  size: z.string().trim().max(40).default(""),
  qty: z.number().int().min(0).max(99),
});

export type CartItemInput = z.infer<typeof cartItemInputSchema>;
export type CartQtyInput = z.infer<typeof cartQtySchema>;
