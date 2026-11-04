import { fail } from "@/lib/api-response";
import { getReviewPhoto } from "@/server/storage/review-photos";

/** Public: an attached review photo, e.g. /api/review-photos/<hexId>. */
export async function GET(
  _req: Request,
  ctx: RouteContext<"/api/review-photos/[id]">,
) {
  const { id } = await ctx.params;
  const photo = await getReviewPhoto(id);
  if (!photo) return fail(404, "not_found", "Photo not found.");
  return new Response(photo.data as BodyInit, {
    headers: {
      "Content-Type": photo.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
