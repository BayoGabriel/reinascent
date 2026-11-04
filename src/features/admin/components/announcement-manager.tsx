import { Icon } from "@/components/ui/Icon";
import type { Announcement } from "@/features/announcements/types";
import {
  deleteAnnouncementAction,
  toggleAnnouncementAction,
} from "@/features/admin/actions";
import { DeleteButton } from "./delete-button";
import { AnnouncementForm } from "./announcement-form";

/** Announcement list (toggle/delete) plus the create form. */
export function AnnouncementManager({ items }: { items: Announcement[] }) {
  return (
    <div>
      <ul className="divide-y divide-line">
        {items.map((a) => (
          <li key={a.id} className="flex items-center gap-4 py-3">
            <Icon name="megaphone" className="size-4 shrink-0 text-cocoa/60" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[#1F253F]">{a.text}</p>
              <p className="text-xs text-cocoa/60">
                {a.variant} · order {a.order}
                {a.href ? ` · ${a.href}` : ""}
              </p>
            </div>
            <form action={toggleAnnouncementAction.bind(null, a.id, !a.isActive)}>
              <button
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  a.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-zinc-100 text-zinc-500"
                }`}
              >
                {a.isActive ? "Live" : "Off"}
              </button>
            </form>
            <DeleteButton label="Delete announcement" action={deleteAnnouncementAction.bind(null, a.id)} />
          </li>
        ))}
        {!items.length && (
          <li className="py-6 text-center text-sm text-cocoa/70">No announcements yet.</li>
        )}
      </ul>
      <AnnouncementForm />
    </div>
  );
}
