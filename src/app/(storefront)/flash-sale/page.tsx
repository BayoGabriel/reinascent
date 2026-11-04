import { Suspense } from "react";
import type { Metadata } from "next";
import { FlashSaleHero } from "@/components/products/FlashSaleHero";
import { Recommendations } from "@/components/products/Recommendations";
import { ShopResults } from "@/components/products/ShopResults";
import { listSaleProducts } from "@/features/products/service";

export const metadata: Metadata = { title: "Flash Sale — Raina Scents" };

interface FlashSalePageProps {
  searchParams: Promise<{ q?: string; category?: string }>;
}

export default async function FlashSalePage({
  searchParams,
}: FlashSalePageProps) {
  const all = await listSaleProducts(48);
  const categories = [...new Set(all.map((p) => p.badge).filter(Boolean))];
  return (
    <>
      <FlashSaleHero />
      {/* Filters + grid read searchParams and the wishlist — request-time
          data that streams in behind the boundary. */}
      <Suspense fallback={null}>
        <ShopResults
          searchParams={searchParams}
          products={all}
          categories={categories}
          emptyMessage="No flash-sale pieces right now — check back soon."
        />
      </Suspense>
      <Suspense fallback={null}>
        <Recommendations />
      </Suspense>
    </>
  );
}
