import { updateSiteSettings } from "@/features/settings/service";
import { siteSettingsSchema } from "@/features/settings/schema";
import { apiGuard } from "@/server/auth/api-guard";
import { fail, ok, readJson, validationMessage } from "@/lib/api-response";

export async function PUT(request: Request) {
  const denied = await apiGuard(request, "settings:manage");
  if (denied) return denied;
  const parsed = siteSettingsSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail(400, "bad_request", validationMessage(parsed.error));
  }
  const res = await updateSiteSettings(parsed.data);
  return res.ok ? ok(res.data) : fail(res.status, res.code, res.message);
}
