import { Suspense } from "react";

import { AdminShell } from "@/features/admin/components/admin-shell";

/**
 * Session reads are request-time under Cache Components, so the
 * authorization shell sits behind a Suspense boundary and streams in.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense
      fallback={
        <main className="flex flex-1 items-center justify-center p-8">
          <p className="text-sm text-zinc-500">Checking access…</p>
        </main>
      }
    >
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
