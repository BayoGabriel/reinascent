"use client";

import { useActionState, useState } from "react";

import { saveSectionAction } from "@/features/admin/actions";
import type { ContentSection } from "@/features/content-management/types";

const box =
  "rounded-lg border border-line bg-white px-3 py-2 text-sm text-[#1F253F] outline-none focus:border-gold";

/** JSON editor for a content section — validated server-side on save. */
export function SectionEditor({
  label,
  sectionKey,
  type,
  section,
}: {
  label: string;
  sectionKey: string;
  type: string;
  section: ContentSection | null;
}) {
  const [state, formAction, pending] = useActionState(saveSectionAction, {});
  const [json, setJson] = useState(
    section ? JSON.stringify(section.data, null, 2) : "{}",
  );
  return (
    <form action={formAction} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <input type="hidden" name="key" value={sectionKey} />
      <input type="hidden" name="type" value={type} />
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#1F253F]">{label}</h3>
        <div className="flex items-center gap-2">
          {section && (
            <span className="text-xs text-cocoa/50">v{section.version}</span>
          )}
          <select name="status" defaultValue={section?.status ?? "published"} className={box} aria-label="Status">
            <option value="published">published</option>
            <option value="draft">draft</option>
          </select>
        </div>
      </div>
      <textarea
        name="data"
        value={json}
        onChange={(e) => setJson(e.target.value)}
        rows={10}
        spellCheck={false}
        className="w-full rounded-lg border border-line bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-100 outline-none focus:border-gold"
      />
      <div className="mt-3 flex items-center justify-between">
        {state.message ? (
          <p className={`text-xs ${state.ok ? "text-emerald-600" : "text-red-600"}`}>
            {state.message}
            {state.fieldErrors?.data?.[0] ? ` — ${state.fieldErrors.data[0]}` : ""}
          </p>
        ) : (
          <span />
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-ink px-5 py-2 text-sm font-medium text-white hover:bg-cocoa disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save section"}
        </button>
      </div>
    </form>
  );
}
