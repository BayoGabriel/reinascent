import {
  createAnnouncement,
  listAllAnnouncements,
} from "@/features/announcements/service";
import { announcementInputSchema } from "@/features/announcements/schema";
import { apiGuard } from "@/server/auth/api-guard";
import { fail, ok, readJson, validationMessage } from "@/lib/api-response";

export async function GET(request: Request) {
  const denied = await apiGuard(request, "content:manage");
  if (denied) return denied;
  const items = await listAllAnnouncements();
  if (!items) return fail(503, "internal", "Database is not configured or unreachable.");
  return ok(items);
}

export async function POST(request: Request) {
  const denied = await apiGuard(request, "content:manage");
  if (denied) return denied;
  const parsed = announcementInputSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail(400, "bad_request", validationMessage(parsed.error));
  }
  const res = await createAnnouncement(parsed.data);
  return res.ok ? ok(res.data, { status: 201 }) : fail(res.status, res.code, res.message);
}
