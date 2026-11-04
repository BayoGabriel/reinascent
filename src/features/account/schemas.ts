import { z } from "zod";

import { emailSchema, passwordSchema } from "@/features/auth/schemas";

/** Account screen input contracts; validated on the server inside actions. */

const namePart = z
  .string()
  .trim()
  .min(1, "Required.")
  .max(60, "Must be at most 60 characters.");

const phoneSchema = z
  .string()
  .trim()
  .max(24, "Phone number is too long.")
  .regex(/^\+?[0-9 ()-]*$/, "Enter a valid phone number.")
  .or(z.literal(""));

export const profileSchema = z.object({
  firstName: namePart,
  lastName: namePart,
  email: emailSchema,
  phone: phoneSchema,
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    error: "Passwords do not match.",
  });

export const addressSchema = z.object({
  name: namePart,
  phone: z
    .string()
    .trim()
    .min(5, "Enter a telephone number.")
    .max(24, "Phone number is too long."),
  address: z
    .string()
    .trim()
    .min(5, "Enter your address.")
    .max(300, "Address is too long."),
});

/** Luhn check — rejects mistyped card numbers before tokenization. */
export function isLuhnValid(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

const currentYear = new Date().getFullYear();

export const cardSchema = z.object({
  nameOnCard: z
    .string()
    .trim()
    .min(2, "Enter the name on the card.")
    .max(80, "Name is too long."),
  cardNumber: z
    .string()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .pipe(
      z
        .string()
        .regex(/^\d{12,19}$/, "Enter a valid card number.")
        .refine(isLuhnValid, "Enter a valid card number."),
    ),
  expMonth: z.coerce
    .number()
    .int()
    .min(1, "MM")
    .max(12, "MM"),
  expYear: z.coerce
    .number()
    .int()
    .min(currentYear, "Card has expired.")
    .max(currentYear + 20, "Invalid year."),
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, "Enter the 3–4 digit CVV."),
}).refine(
  (d) => d.expYear > currentYear || d.expMonth >= new Date().getMonth() + 1,
  { path: ["expMonth"], error: "Card has expired." },
);

export const complaintSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "Give your complaint a subject.")
    .max(120, "Subject is too long."),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a bit more.")
    .max(2000, "Message is too long."),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type PasswordChangeInput = z.infer<typeof passwordChangeSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CardInput = z.infer<typeof cardSchema>;
export type ComplaintInput = z.infer<typeof complaintSchema>;
