import { Suspense } from "react";

import { NewArrivals } from "@/components/home/NewArrivals";
import { TopSellers } from "@/components/home/TopSellers";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { FlashSaleBanner } from "@/features/content-management/components/FlashSaleBanner";
import { HeroSection } from "@/features/content-management/components/HeroSection";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhyChooseUs />
      {/* These sections read the visitor's wishlist, so they stream in
          behind boundaries while the static shell prerenders. */}
      <Suspense fallback={null}>
        <TopSellers />
      </Suspense>
      <Suspense fallback={null}>
        <NewArrivals />
      </Suspense>
      <FlashSaleBanner />
    </>
  );
}
