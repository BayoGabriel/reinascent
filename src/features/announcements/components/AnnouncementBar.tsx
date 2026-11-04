import { getVisibleAnnouncements } from "../service";
import { AnnouncementMarquee } from "./AnnouncementMarquee";

/**
 * Streams inside a Suspense boundary: announcement data is cached, but the
 * publish/expiry window check runs per request.
 */
export async function AnnouncementBar() {
  const items = await getVisibleAnnouncements();
  return <AnnouncementMarquee items={items} />;
}
