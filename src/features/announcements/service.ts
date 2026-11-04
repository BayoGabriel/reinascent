import { connection } from "next/server";
import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { getAnnouncementRepository } from "@/server/repositories/announcement.repository";
import { notFound, serviceUnavailable, type ServiceResult } from "@/types/api";
import { fallbackAnnouncements } from "./seed";
import { filterLive } from "./schedule";
import type { AnnouncementInput, AnnouncementUpdate } from "./schema";
import type { Announcement } from "./types";

const TAG = "announcements";

/** Active announcements (schedule windows are filtered per request). */
export async function listActiveAnnouncements(): Promise<Announcement[]> {
  "use cache";
  cacheTag(TAG);
  cacheLife("minutes");
  const repo = await getAnnouncementRepository();
  if (!repo) return fallbackAnnouncements;
  return repo.findActive();
}

/** Request-time read for the storefront bar — fresh window filtering. */
export async function getVisibleAnnouncements(): Promise<Announcement[]> {
  await connection();
  return filterLive(await listActiveAnnouncements());
}

export async function listAllAnnouncements(): Promise<Announcement[] | null> {
  const repo = await getAnnouncementRepository();
  return repo ? repo.listAll() : null;
}

export async function createAnnouncement(
  input: AnnouncementInput,
): Promise<ServiceResult<Announcement>> {
  const repo = await getAnnouncementRepository();
  if (!repo) return serviceUnavailable();
  const data = await repo.create(input);
  revalidateTag(TAG, "max");
  return { ok: true, data };
}

export async function updateAnnouncement(
  id: string,
  patch: AnnouncementUpdate,
): Promise<ServiceResult<Announcement>> {
  const repo = await getAnnouncementRepository();
  if (!repo) return serviceUnavailable();
  const data = await repo.update(id, patch);
  if (!data) return notFound("Announcement");
  revalidateTag(TAG, "max");
  return { ok: true, data };
}

export async function deleteAnnouncement(
  id: string,
): Promise<ServiceResult<{ id: string }>> {
  const repo = await getAnnouncementRepository();
  if (!repo) return serviceUnavailable();
  if (!(await repo.remove(id))) return notFound("Announcement");
  revalidateTag(TAG, "max");
  return { ok: true, data: { id } };
}
