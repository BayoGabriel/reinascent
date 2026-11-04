"use client";

import { useActionState, useState } from "react";

import { saveSettingsAction } from "@/features/admin/actions";
import type { SiteSettings } from "@/features/settings/types";

const box =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-[#1F253F] outline-none placeholder:text-cocoa/50 focus:border-gold";

/** Brand, navigation, and CTA fields — footer stays a JSON blob. */
export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, pending] = useActionState(saveSettingsAction, {});
  const [brand, setBrand] = useState(settings.brand);
  const [cta, setCta] = useState(settings.cta ?? { label: "", href: "" });
  const [links, setLinks] = useState(settings.navLinks);
  const [footerJson, setFooterJson] = useState(
    JSON.stringify(settings.footer ?? {}, null, 2),
  );

  let footer: unknown = {};
  try {
    footer = JSON.parse(footerJson);
  } catch {
    footer = settings.footer ?? {};
  }
  const payload = JSON.stringify({ brand, navLinks: links, cta, footer });

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="payload" value={payload} />
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-emerald-600" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-[#1F253F]">Brand</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <input value={brand.name} onChange={(e) => setBrand({ ...brand, name: e.target.value })} placeholder="Brand name" aria-label="Brand name" className={box} />
          <input value={brand.tagline} onChange={(e) => setBrand({ ...brand, tagline: e.target.value })} placeholder="Tagline" aria-label="Tagline" className={box} />
          <input value={brand.logoUrl} onChange={(e) => setBrand({ ...brand, logoUrl: e.target.value })} placeholder="Logo URL" aria-label="Logo URL" className={box} />
        </div>
      </section>
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-[#1F253F]">Header navigation</h2>
        <div className="space-y-2">
          {links.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input value={l.label} onChange={(e) => setLinks(links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} placeholder="Label" aria-label={`Link ${i + 1} label`} className={`${box} max-w-44`} />
              <input value={l.href} onChange={(e) => setLinks(links.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))} placeholder="/products" aria-label={`Link ${i + 1} href`} className={box} />
              <button type="button" onClick={() => setLinks(links.filter((_, j) => j !== i))} className="rounded-lg px-3 text-cocoa/50 hover:bg-red-50 hover:text-red-600" aria-label="Remove link">✕</button>
            </div>
          ))}
        </div>
        {links.length < 8 && (
          <button type="button" onClick={() => setLinks([...links, { label: "", href: "/" }])} className="mt-2 text-xs font-medium text-gold hover:text-cocoa">
            + Add link
          </button>
        )}
        <div className="mt-4 flex gap-2 border-t border-line pt-4">
          <span className="self-center text-sm font-medium text-[#1F253F]">CTA button</span>
          <input value={cta.label} onChange={(e) => setCta({ ...cta, label: e.target.value })} placeholder="Shop Now" aria-label="CTA label" className={`${box} max-w-40`} />
          <input value={cta.href} onChange={(e) => setCta({ ...cta, href: e.target.value })} placeholder="/products" aria-label="CTA href" className={box} />
        </div>
      </section>
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-[#1F253F]">Footer (JSON)</h2>
        <textarea value={footerJson} onChange={(e) => setFooterJson(e.target.value)} rows={12} spellCheck={false} aria-label="Footer JSON" className="w-full rounded-lg border border-line bg-zinc-950 p-4 font-mono text-xs leading-relaxed text-zinc-100 outline-none focus:border-gold" />
      </section>
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white hover:bg-cocoa disabled:opacity-60">
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
