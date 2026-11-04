import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { ReactNode } from "react";

import { Icon } from "@/components/ui/Icon";
import { signOutAction } from "@/features/auth/actions";
import { getCurrentUser, requireAdmin } from "@/server/auth/current-user";
import { AdminNav } from "./admin-nav";

/**
 * Admin chrome: dark sidebar + topbar. Also the authorization gate —
 * renders the access-denied state instead of the shell for non-admins.
 */
export async function AdminShell({ children }: { children: ReactNode }) {
  await connection();
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  if (!(await requireAdmin())) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-3 bg-background p-8">
        <h1 className="text-2xl font-semibold text-[#1F253F]">Access denied</h1>
        <p className="text-sm text-cocoa">
          Your account does not have permission to view this area.
        </p>
        <Link href="/" className="text-sm font-medium text-gold underline">
          Back to the store
        </Link>
      </main>
    );
  }
  const initials = (user.displayName || user.email)
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col bg-ink px-4 py-6 lg:flex">
        <Link href="/admin" className="mb-8 flex items-baseline gap-2 px-3">
          <span className="font-serif text-lg font-medium text-white">
            Raina Scents
          </span>
          <span className="rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-soft">
            Admin
          </span>
        </Link>
        <AdminNav />
        <div className="mt-6 border-t border-white/10 pt-4">
          <Link
            href="/"
            className="mb-3 flex items-center gap-2 px-3 text-xs text-white/50 transition-colors hover:text-gold-soft"
          >
            <Icon name="arrowUpRight" className="size-3.5" /> View storefront
          </Link>
          <div className="flex items-center gap-3 px-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-gold/20 text-xs font-semibold text-gold-soft">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user.displayName}
              </p>
              <p className="truncate text-[11px] text-white/40">{user.email}</p>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                aria-label="Sign out"
                className="text-white/40 transition-colors hover:text-gold-soft"
              >
                <Icon name="logout" className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="min-w-0 flex-1 lg:pl-60">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
