import type { CSSProperties } from "react";
import type { Announcement } from "../types";
import { AnnouncementItem } from "./AnnouncementItem";

/**
 * CSS-only scrolling ticker — no client JS. The item list is rendered twice so
 * the -50% translate loops seamlessly; hover pauses, reduced-motion disables
 * animation and falls back to horizontal scroll.
 */
export function AnnouncementMarquee({ items }: { items: Announcement[] }) {
  if (!items.length) return null;
  const duration = Math.min(70, 14 + items.length * 9);
  const style = { "--marquee-duration": `${duration}s` } as CSSProperties;
  return (
    <div
      role="region"
      aria-label="Announcements"
      className="marquee-viewport group overflow-hidden border-b border-gold/25 bg-ink"
    >
      <div
        className="marquee-track flex w-max items-center group-hover:[animation-play-state:paused]"
        style={style}
      >
        <ItemRow items={items} />
        <ItemRow items={items} hidden />
      </div>
    </div>
  );
}

function ItemRow({ items, hidden }: { items: Announcement[]; hidden?: boolean }) {
  return (
    <ul className="flex items-center gap-10 py-2.5 pl-10" aria-hidden={hidden || undefined}>
      {items.map((item) => (
        <li key={item.id} className="contents">
          <AnnouncementItem item={item} />
          <span aria-hidden="true" className="text-[9px] text-gold/45">
            ✦
          </span>
        </li>
      ))}
    </ul>
  );
}
