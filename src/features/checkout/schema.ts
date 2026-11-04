import { z } from "zod";

/** Shipping/contact details collected at checkout — only what fulfilment
 *  and Paystack need. Prices are never accepted from the client. */
export const checkoutInputSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(30)
    .regex(/^[+\d][\d\s()-]*$/, "Enter a valid phone number"),
  address: z.string().trim().min(5, "Enter a delivery address").max(400),
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema>;
