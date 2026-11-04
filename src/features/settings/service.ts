import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { getSettingsRepository } from "@/server/repositories/settings.repository";
import { serviceUnavailable, type ServiceResult } from "@/types/api";
import { settingsFallback } from "./seed";
import type { SiteSettingsInput } from "./schema";
import type { SiteSettings } from "./types";

const TAG = "settings";

/** Site settings for storefront chrome; seed defaults when unset. */
export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(TAG);
  cacheLife("hours");
  const repo = await getSettingsRepository();
  return (repo ? await repo.get() : null) ?? settingsFallback;
}

export async function updateSiteSettings(
  input: SiteSettingsInput,
): Promise<ServiceResult<SiteSettings>> {
  const repo = await getSettingsRepository();
  if (!repo) return serviceUnavailable();
  const saved = await repo.save(input);
  revalidateTag(TAG, "max");
  return { ok: true, data: saved };
}
