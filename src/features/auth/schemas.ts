import { z } from "zod";

/**
 * Auth input contracts. Validation runs on the server inside actions;
 * these schemas are also reused by the admin bootstrap script.
 */
export const emailSchema = z
  .string()
  .trim()
  .pipe(z.email({ error: "Enter a valid email address." }));

export const passwordSchema = z
  .string()
  .min(12, "Password must be at least 12 characters.")
  .max(128, "Password must be at most 128 characters.")
  .regex(/[a-zA-Z]/, "Password must contain a letter.")
  .regex(/[0-9]/, "Password must contain a number.");

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters.")
  .max(80, "Name must be at most 80 characters.");

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password."),
});

export const registerSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const adminBootstrapSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema.default("Administrator"),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type AdminBootstrapInput = z.infer<typeof adminBootstrapSchema>;
