import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";

import { PageHeader } from "@/features/admin/components/page-header";
import { SectionEditor } from "@/features/admin/components/section-editor";
import { AnnouncementManager } from "@/features/admin/components/announcement-manager";
import { getSectionForAdmin } from "@/features/content-management/service";
import { listAllAnnouncements } from "@/features/announcements/service";

export const metadata: Metadata = { title: "Content — Raina Scents Admin" };

const SECTIONS = [
  { key: "home.hero", type: "hero", label: "Homepage hero" },
  { key: "home.flash_sale", type: "promo_banner", label: "Flash-sale banner" },
  { key: "about.page", type: "about_page", label: "About page" },
] as const;

export default function AdminContentPage() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await connection();
  const [announcements, ...sections] = await Promise.all([
    listAllAnnouncements(),
    ...SECTIONS.map((s) => getSectionForAdmin(s.key)),
  ]);
  return (
    <>
      <PageHeader
        title="Content"
        description="Storefront sections and announcements."
      />
      <section className="mb-8 rounded-2xl border border-line bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-[#1F253F]">Announcement bar</h2>
        <AnnouncementManager items={announcements ?? []} />
      </section>
      <div className="space-y-6">
        {SECTIONS.map((s, i) => (
          <SectionEditor
            key={s.key}
            label={s.label}
            sectionKey={s.key}
            type={s.type}
            section={sections[i].ok ? sections[i].data : null}
          />
        ))}
      </div>
    </>
  );
}
