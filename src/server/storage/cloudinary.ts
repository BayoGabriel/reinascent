import "server-only";

import { createHash } from "node:crypto";

import { env } from "@/lib/env";
import { ServiceError } from "@/lib/errors";
import { logger } from "@/lib/logger";

/**
 * Cloudinary signed-upload adapter — no SDK: the upload POST is signed with
 * SHA-1 over the sorted params + API secret. Admin product images land in
 * `CLOUDINARY_UPLOAD_FOLDER`; only the returned secure_url is persisted on
 * the product (the secret never reaches the client).
 */

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // Cloudinary free tier image cap
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);
const TIMEOUT_MS = 30_000;

export interface UploadedImage {
  url: string;
  publicId: string;
}

export function cloudinaryConfigured(): boolean {
  return Boolean(
    env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret,
  );
}

/** SHA-1 over alphabetically-sorted params — Cloudinary's signing scheme. */
export function signParams(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const toSign = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");
}

function validateFile(file: File): void {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new ServiceError(
      "bad_request",
      "Images must be JPEG, PNG, WebP, AVIF, or GIF.",
    );
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new ServiceError("bad_request", "Each image must be under 10MB.");
  }
}

/** Upload one file to Cloudinary; returns its secure URL and public id. */
export async function uploadImage(file: File): Promise<UploadedImage> {
  validateFile(file);
  if (!cloudinaryConfigured()) {
    throw new ServiceError(
      "internal",
      "Image uploads are not configured yet.",
      503,
    );
  }
  const cloudName = env.cloudinaryCloudName as string;
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder: env.cloudinaryFolder, timestamp };
  const signature = signParams(params, env.cloudinaryApiSecret as string);

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", env.cloudinaryApiKey as string);
  body.append("timestamp", String(timestamp));
  body.append("folder", params.folder);
  body.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body, signal: AbortSignal.timeout(TIMEOUT_MS) },
  );
  const data = (await res.json().catch(() => null)) as {
    secure_url?: string;
    public_id?: string;
  } | null;
  if (!res.ok || !data?.secure_url || !data.public_id) {
    logger.warn("cloudinary upload failed", { status: res.status });
    throw new ServiceError("internal", "Image upload failed.", 502);
  }
  return { url: data.secure_url, publicId: data.public_id };
}
