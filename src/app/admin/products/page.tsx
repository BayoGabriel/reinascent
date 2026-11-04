import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import type { Metadata } from "next";

import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/money";
import { listAllProducts } from "@/features/products/service";
import { deleteProductAction } from "@/features/admin/actions";
import { PageHeader } from "@/features/admin/components/page-header";
import { DeleteButton } from "@/features/admin/components/delete-button";

export const metadata: Metadata = { title: "Products — Raina Scents Admin" };

export default function AdminProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}

async function ProductsContent() {
  await connection();
  const products = (await listAllProducts()) ?? [];
  return (
    <>
      <PageHeader
        title="Products"
        description={`${products.length} products in the catalog`}
        actions={
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cocoa"
          >
            <Icon name="plus" className="size-4" /> New product
          </Link>
        }
      />
      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-cocoa/60">
              <th className="px-5 py-3.5 font-medium">Product</th>
              <th className="px-4 py-3.5 font-medium">Price</th>
              <th className="px-4 py-3.5 font-medium">Badge</th>
              <th className="px-4 py-3.5 font-medium">Rating</th>
              <th className="px-4 py-3.5 font-medium">Status</th>
              <th className="px-5 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className="transition-colors hover:bg-cream/40">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {p.images[0]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0].url} alt="" className="size-10 rounded-lg object-cover" />
                    ) : (
                      <span className="size-10 rounded-lg bg-cream" />
                    )}
                    <div>
                      <p className="font-medium text-[#1F253F]">{p.name}</p>
                      <p className="text-xs text-cocoa/60">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#1F253F]">
                  {formatPrice(p.price)}
                  {p.compareAtPrice != null && (
                    <span className="ml-1.5 text-xs text-cocoa/50 line-through">
                      {formatPrice(p.compareAtPrice)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-cocoa">{p.badge || "—"}</td>
                <td className="px-4 py-3 text-cocoa">
                  {p.ratingCount ? `${p.ratingValue.toFixed(1)} (${p.ratingCount})` : "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="flex flex-col gap-1 text-xs">
                    <span className={p.isActive ? "text-emerald-600" : "text-zinc-400"}>
                      {p.isActive ? "● Active" : "○ Hidden"}
                    </span>
                    {p.isFeatured && <span className="text-gold">★ Featured</span>}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/admin/products/${p.id}`}
                      aria-label={`Edit ${p.name}`}
                      className="rounded-lg p-2 text-cocoa/60 transition-colors hover:bg-cream hover:text-[#1F253F]"
                    >
                      <Icon name="pencil" className="size-4" />
                    </Link>
                    <DeleteButton
                      label={`Delete ${p.name}`}
                      action={deleteProductAction.bind(null, p.id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {!products.length && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-cocoa/70">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
