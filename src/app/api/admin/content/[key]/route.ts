import {
  getSectionForAdmin,
  upsertSection,
} from "@/features/content-management/service";
import { sectionUpsertSchema } from "@/features/content-management/schema";
import { apiGuard } from "@/server/auth/api-guard";
import { fail, ok, readJson, validationMessage } from "@/lib/api-response";

type Ctx = RouteContext<"/api/admin/content/[key]">;
const KEY_RE = /^[a-z0-9][a-z0-9._-]{0,60}$/i;

export async function GET(request: Request, ctx: Ctx) {
  const denied = await apiGuard(request, "content:manage");
  if (denied) return denied;
  const { key } = await ctx.params;
  if (!KEY_RE.test(key)) return fail(400, "bad_request", "Invalid section key.");
  const res = await getSectionForAdmin(key);
  return res.ok ? ok(res.data) : fail(res.status, res.code, res.message);
}

export async function PUT(request: Request, ctx: Ctx) {
  const denied = await apiGuard(request, "content:manage");
  if (denied) return denied;
  const { key } = await ctx.params;
  if (!KEY_RE.test(key)) return fail(400, "bad_request", "Invalid section key.");
  const parsed = sectionUpsertSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail(400, "bad_request", validationMessage(parsed.error));
  }
  const res = await upsertSection(key, parsed.data);
  return res.ok ? ok(res.data) : fail(res.status, res.code, res.message);
}
