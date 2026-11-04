"use client";

import { useActionState } from "react";

import { saveAnnouncementAction } from "@/features/admin/actions";

const box =
  "rounded-lg border border-line bg-white px-3 py-2 text-sm text-[#1F253F] outline-none placeholder:text-cocoa/50 focus:border-gold";

/** Compact create form for a new announcement bar entry. */
export function AnnouncementForm() {
  const [state, formAction, pending] = useActionState(saveAnnouncementAction, {});
  return (
    <form
      action={formAction}
      className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-cream/60 p-3"
    >
      <input
        name="text"
        required
        placeholder="Announcement text…"
        className={`${box} min-w-56 flex-1`}
      />
      <input name="href" placeholder="/flash-sale" className={`${box} w-36`} />
      <select name="variant" defaultValue="default" className={box} aria-label="Variant">
        <option value="default">default</option>
        <option value="sale">sale</option>
        <option value="info">info</option>
        <option value="warning">warning</option>
      </select>
      <select name="icon" defaultValue="none" className={box} aria-label="Icon">
        <option value="none">no icon</option>
        <option value="truck">truck</option>
        <option value="tag">tag</option>
        <option value="sparkles">sparkles</option>
      </select>
      <input
        name="order"
        type="number"
        defaultValue={0}
        aria-label="Sort order"
        className={`${box} w-20`}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-ink px-4 py-2 text-xs font-medium text-white hover:bg-cocoa disabled:opacity-60"
      >
        {pending ? "Adding…" : "Add"}
      </button>
      {state.message && (
        <p className={`w-full text-xs ${state.ok ? "text-emerald-600" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}
