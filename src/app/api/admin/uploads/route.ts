import { apiGuard } from "@/server/auth/api-guard";
import { uploadImage } from "@/server/storage/cloudinary";
import { ServiceError } from "@/lib/errors";
import { fail, ok } from "@/lib/api-response";
import { logger } from "@/lib/logger";

/** Admin product-image upload → Cloudinary. Multipart form with a `file`
 *  field; returns `{ data: { url, publicId } }`. */
export async function POST(request: Request) {
  const denied = await apiGuard(request, "catalog:manage");
  if (denied) return denied;

  let file: File | null = null;
  try {
    const form = await request.formData();
    const value = form.get("file");
    if (value instanceof File && value.size > 0) file = value;
  } catch {
    file = null;
  }
  if (!file) return fail(400, "bad_request", "Attach an image file.");

  try {
    return ok(await uploadImage(file));
  } catch (error) {
    if (error instanceof ServiceError) {
      return fail(error.status, error.code, error.message);
    }
    logger.error("image upload failed", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return fail(500, "internal", "Image upload failed.");
  }
}
