import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";
import type { Announcement, AnnouncementVariant } from "../types";

const VARIANT_STYLES: Record<AnnouncementVariant, string> = {
  default: "text-gold-soft",
  info: "text-stone-200",
  warning: "text-amber-300",
  sale: "rounded-full bg-gradient-to-r from-gold to-gold-soft px-4 py-0.5 font-semibold text-[#1F253F] shadow-[0_0_14px_rgba(212,175,55,0.35)] motion-safe:animate-pulse",
};

export function AnnouncementItem({ item }: { item: Announcement }) {
  const content = (
    <>
      {item.icon !== "none" && (
        <Icon name={item.icon as IconName} className="size-3.5 shrink-0" />
      )}
      <span>{item.text}</span>
    </>
  );
  const body = item.href ? (
    <Link
      href={item.href}
      className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
    >
      {content}
    </Link>
  ) : (
    <span className="flex items-center gap-2.5">{content}</span>
  );
  return (
    <li
      className={cn(
        "flex items-center font-serif text-[11px] uppercase tracking-[0.22em] sm:text-xs",
        VARIANT_STYLES[item.variant],
      )}
    >
      {body}
    </li>
  );
}
