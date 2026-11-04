import { Suspense } from "react";
import type { Metadata } from "next";
import { Recommendations } from "@/components/products/Recommendations";
import { ShopResults } from "@/components/products/ShopResults";
import { TopSellersHero } from "@/components/products/TopSellersHero";
import { listFeaturedProducts } from "@/features/products/service";

export const metadata: Metadata = { title: "Top Sellers — Raina Scents" };

interface TopSellersPageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function TopSellersPage({
  searchParams,
}: TopSellersPageProps) {
  const all = await listFeaturedProducts(48);
  const categories = [...new Set(all.map((p) => p.badge).filter(Boolean))];
  return (
    <>
      <TopSellersHero />
      {/* Filters + grid read searchParams and the wishlist — request-time
          data that streams in behind the boundary. */}
      <Suspense fallback={null}>
        <ShopResults
          searchParams={searchParams}
          products={all}
          categories={categories}
          emptyMessage="Top sellers are on their way — check back soon."
        />
      </Suspense>
      <Suspense fallback={null}>
        <Recommendations />
      </Suspense>
    </>
  );
}
