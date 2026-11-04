import { z } from "zod";

/**
 * Server-side environment access. Keep secrets out of client bundles —
 * nothing in this file may be imported from a "use client" module.
 *
 * Two contracts coexist deliberately:
 * - `env`: tolerant getters; feature slices that degrade to seed content
 *   use these and treat `null` as "not configured".
 * - `getServerEnv`: strict Zod-validated env for subsystems that cannot run
 *   without real configuration (MongoDB-backed auth, sessions).
 */
export const env = {
  get mongodbUri() {
    return process.env.MONGODB_URI?.trim() || null;
  },
  get mongodbDb() {
    return process.env.MONGODB_DB?.trim() || "sadikecom";
  },
  /** Interim admin credential for admin API routes until full auth lands. */
  get adminApiKey() {
    return process.env.ADMIN_API_KEY?.trim() || null;
  },
  /** Paystack secret key — server-only; absence disables card checkout. */
  get paystackSecretKey() {
    return process.env.PAYSTACK_SECRET_KEY?.trim() || null;
  },
  /** Charge currency sent to Paystack; must match storefront display. */
  get paystackCurrency() {
    return process.env.PAYSTACK_CURRENCY?.trim() || "USD";
  },
  /** Public origin used to build the Paystack callback URL. */
  get appBaseUrl() {
    return process.env.APP_BASE_URL?.trim() || "http://localhost:3000";
  },
  /** Flat shipping fee in major currency units (e.g. 10 → $10.00). */
  get shippingFee() {
    const raw = Number(process.env.SHIPPING_FEE);
    return Number.isFinite(raw) && raw >= 0 ? raw : 0;
  },
  /** Cloudinary credentials for admin product-image uploads. */
  get cloudinaryCloudName() {
    return process.env.CLOUDINARY_CLOUD_NAME?.trim() || null;
  },
  get cloudinaryApiKey() {
    return process.env.CLOUDINARY_API_KEY?.trim() || null;
  },
  get cloudinaryApiSecret() {
    return process.env.CLOUDINARY_API_SECRET?.trim() || null;
  },
  /** Cloudinary folder for product images. */
  get cloudinaryFolder() {
    return process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || "products";
  },
};

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  MONGODB_DB: z.string().min(1, "MONGODB_DB is required"),
  // iron-session requires a password of at least 32 characters.
  SESSION_PASSWORD: z
    .string()
    .min(32, "SESSION_PASSWORD must be at least 32 characters"),
});

export type ServerEnv = z.infer<typeof envSchema>;

/** Parse an arbitrary env map; used directly by tests. */
export function parseServerEnv(
  input: Record<string, string | undefined>,
): ServerEnv {
  const result = envSchema.safeParse(input);
  if (!result.success) {
    const missing = result.error.issues
      .map((issue) => issue.path.join("."))
      .join(", ");
    throw new Error(`Invalid server environment: ${missing}`);
  }
  return result.data;
}

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (!cached) {
    cached = parseServerEnv(process.env);
  }
  return cached;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
