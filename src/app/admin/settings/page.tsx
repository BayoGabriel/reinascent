import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";

import { PageHeader } from "@/features/admin/components/page-header";
import { SettingsForm } from "@/features/admin/components/settings-form";
import { getSiteSettings } from "@/features/settings/service";

export const metadata: Metadata = { title: "Settings — Raina Scents Admin" };

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await connection();
  const settings = await getSiteSettings();
  return (
    <>
      <PageHeader
        title="Settings"
        description="Brand, navigation, and footer configuration."
      />
      <SettingsForm settings={settings} />
    </>
  );
}
