import { getProductBySlug } from "@/features/products/service";
import { fail, ok } from "@/lib/api-response";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Public: a single product by slug, e.g. /api/products/amber-damp-incense */
export async function GET(_req: Request, ctx: RouteContext<"/api/products/[slug]">) {
  const { slug } = await ctx.params;
  if (!SLUG_RE.test(slug)) {
    return fail(400, "bad_request", "Invalid product slug.");
  }
  const product = await getProductBySlug(slug);
  return product ? ok(product) : fail(404, "not_found", "Product not found.");
}
