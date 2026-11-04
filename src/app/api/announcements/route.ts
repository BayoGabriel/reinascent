import { listActiveAnnouncements } from "@/features/announcements/service";
import { filterLive } from "@/features/announcements/schedule";
import { ok } from "@/lib/api-response";

/** Public: announcements currently live (active + inside schedule window). */
export async function GET() {
  return ok(filterLive(await listActiveAnnouncements()));
}
