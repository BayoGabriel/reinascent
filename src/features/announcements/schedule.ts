import type { Announcement } from "./types";

/** Keep items whose schedule window contains `now` (unbounded sides allowed). */
export function filterLive(items: Announcement[], now = Date.now()): Announcement[] {
  return items.filter(
    (a) =>
      (!a.startsAt || Date.parse(a.startsAt) <= now) &&
      (!a.endsAt || Date.parse(a.endsAt) >= now),
  );
}
