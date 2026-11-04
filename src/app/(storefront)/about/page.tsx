import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { AboutMosaic } from "@/components/about/AboutMosaic";
import { CoreValues } from "@/components/about/CoreValues";
import { WhyChoose } from "@/components/about/WhyChoose";
import { getAboutPage } from "@/features/content-management/service";

export const metadata: Metadata = { title: "About — Raina Scents" };

export default async function AboutPage() {
  const content = await getAboutPage();
  return (
    <>
      <AboutHero heading={content.heading} subheading={content.subheading} />
      <AboutMosaic tiles={content.tiles} />
      <CoreValues heading={content.valuesHeading} values={content.values} />
      <WhyChoose why={content.why} />
    </>
  );
}
