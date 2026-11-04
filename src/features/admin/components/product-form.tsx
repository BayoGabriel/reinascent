"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";

import { saveProductAction } from "@/features/admin/actions";
import type { AdminFormState } from "@/features/admin/types";
import type { Product } from "@/features/products/types";
import { ImagesFieldset, type ImageRow } from "./images-fieldset";

const box =
  "w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-[#1F253F] outline-none placeholder:text-cocoa/50 focus:border-gold";
const lbl = "text-sm font-medium text-[#1F253F]";

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className={lbl}>{label}</span>
      {children}
    </div>
  );
}

/** Product create/edit form — serializes to a JSON payload for the action. */
export function ProductForm({ product }: { product: Product | null }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    async (prev: AdminFormState, fd: FormData) => {
      const res = await saveProductAction(prev, fd);
      if (res.ok) setTimeout(() => router.push("/admin/products"), 400);
      return res;
    },
    {},
  );
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [price, setPrice] = useState(product?.price ?? 0);
  const [compareAt, setCompareAt] = useState<number | "">(product?.compareAtPrice ?? "");
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [sizes, setSizes] = useState((product?.sizes ?? []).join(", "));
  const [images, setImages] = useState<ImageRow[]>(
    product?.images.length ? product.images : [{ url: "", alt: "" }],
  );
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);

  const payload = JSON.stringify({
    slug, name, tagline, price: Number(price) || 0,
    compareAtPrice: compareAt === "" ? null : Number(compareAt),
    badge, description,
    sizes: sizes.split(",").map((s) => s.trim()).filter(Boolean),
    images: images.filter((i) => i.url.trim()),
    ratingValue: product?.ratingValue ?? 0,
    ratingCount: product?.ratingCount ?? 0,
    reviews: product?.reviews ?? [],
    isActive, isFeatured,
  });

  return (
    <form action={formAction} className="flex flex-col gap-5 rounded-2xl border border-line bg-white p-6 shadow-sm">
      <input type="hidden" name="payload" value={payload} />
      {product && <input type="hidden" name="id" value={product.id} />}
      {state.message && (
        <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-emerald-600" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <F label="Name"><input value={name} onChange={(e) => setName(e.target.value)} required className={box} /></F>
        <F label="Slug"><input value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="oud-royale-50ml" className={box} /></F>
        <F label="Price ($)"><input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} required className={box} /></F>
        <F label="Compare-at price"><input type="number" step="0.01" min="0" value={compareAt} onChange={(e) => setCompareAt(e.target.value === "" ? "" : Number(e.target.value))} className={box} /></F>
        <F label="Tagline"><input value={tagline} onChange={(e) => setTagline(e.target.value)} className={box} /></F>
        <F label="Badge"><input value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="New Arrival / Sale / Best Seller" className={box} /></F>
      </div>
      <F label="Description"><textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={box} /></F>
      <F label="Sizes (comma separated)"><input value={sizes} onChange={(e) => setSizes(e.target.value)} placeholder="50ml, 100ml" className={box} /></F>
      <ImagesFieldset images={images} onChange={setImages} />
      <div className="flex gap-6 text-sm text-[#1F253F]">
        <label className="flex items-center gap-2"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="size-4 accent-gold" /> Active (visible in store)</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="size-4 accent-gold" /> Featured</label>
      </div>
      <div className="flex justify-end gap-3 border-t border-line pt-5">
        <button type="button" onClick={() => router.back()} className="rounded-full border border-line px-5 py-2 text-sm font-medium text-[#1F253F] hover:bg-cream">Cancel</button>
        <button type="submit" disabled={pending} className="rounded-full bg-ink px-6 py-2 text-sm font-medium text-white hover:bg-cocoa disabled:opacity-60">
          {pending ? "Saving…" : "Save product"}
        </button>
      </div>
    </form>
  );
}
