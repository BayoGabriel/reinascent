import {
  deleteAnnouncement,
  updateAnnouncement,
} from "@/features/announcements/service";
import { announcementUpdateSchema } from "@/features/announcements/schema";
import { apiGuard } from "@/server/auth/api-guard";
import { fail, ok, readJson, validationMessage } from "@/lib/api-response";

type Ctx = RouteContext<"/api/admin/announcements/[id]">;

export async function PATCH(request: Request, ctx: Ctx) {
  const denied = await apiGuard(request, "content:manage");
  if (denied) return denied;
  const { id } = await ctx.params;
  const parsed = announcementUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail(400, "bad_request", validationMessage(parsed.error));
  }
  const res = await updateAnnouncement(id, parsed.data);
  return res.ok ? ok(res.data) : fail(res.status, res.code, res.message);
}

export async function DELETE(request: Request, ctx: Ctx) {
  const denied = await apiGuard(request, "content:manage");
  if (denied) return denied;
  const { id } = await ctx.params;
  const res = await deleteAnnouncement(id);
  return res.ok ? ok(res.data) : fail(res.status, res.code, res.message);
}
