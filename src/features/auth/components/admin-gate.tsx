import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import {
  getCurrentUser,
  requireAdmin,
} from "@/server/auth/current-user";

/**
 * Server-side authorization gate for the admin segment. Rendered inside a
 * Suspense boundary because session reads are request-time under Cache
 * Components. Unauthenticated users are sent to sign-in; authenticated
 * non-admins receive a 403-style response, not a redirect loop.
 */
export async function AdminGate({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  const admin = await requireAdmin();
  if (!admin) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 p-8">
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Your account does not have permission to view this area.
        </p>
      </main>
    );
  }
  return <>{children}</>;
}
