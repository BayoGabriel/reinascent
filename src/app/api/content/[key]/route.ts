import { getPublishedSection } from "@/features/content-management/service";
import { fail, ok } from "@/lib/api-response";

const KEY_RE = /^[a-z0-9][a-z0-9._-]{0,60}$/i;

/** Public: a single published content section, e.g. /api/content/home.hero */
export async function GET(_req: Request, ctx: RouteContext<"/api/content/[key]">) {
  const { key } = await ctx.params;
  if (!KEY_RE.test(key)) {
    return fail(400, "bad_request", "Invalid section key.");
  }
  const section = await getPublishedSection(key);
  return section ? ok(section) : fail(404, "not_found", "Section not found.");
}
