import { Suspense } from "react";
import type { Metadata } from "next";
import { ShopHero } from "@/components/products/ShopHero";
import { Recommendations } from "@/components/products/Recommendations";
import { ShopResults } from "@/components/products/ShopResults";
import { listProducts } from "@/features/products/service";

export const metadata: Metadata = { title: "Shop — Raina Scents" };

interface ProductsPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const all = await listProducts(48);
  const categories = [...new Set(all.map((p) => p.badge).filter(Boolean))];
  return (
    <>
      <ShopHero />
      {/* Filters + grid read searchParams and the wishlist — request-time
          data that streams in behind the boundary. */}
      <Suspense fallback={null}>
        <ShopResults
          searchParams={searchParams}
          products={all}
          categories={categories}
          emptyMessage="New pieces are on their way — check back soon."
        />
      </Suspense>
      <Suspense fallback={null}>
        <Recommendations />
      </Suspense>
    </>
  );
}
