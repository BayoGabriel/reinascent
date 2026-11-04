import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";

import { AccountSidebar } from "@/features/account/components/account-sidebar";
import { BackButton } from "@/features/account/components/back-button";
import { requireUser } from "@/server/auth/current-user";

/** My Account shell — every screen requires a signed-in customer. */
export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <BackButton />
      <h1 className="my-8 text-center font-serif text-3xl font-medium tracking-tight text-[#1F253F] sm:text-4xl">
        My Account
      </h1>
      <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <Suspense fallback={null}>
          <AccountRail />
        </Suspense>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

async function AccountRail() {
  await connection();
  const user = await requireUser();
  return <AccountSidebar user={user} />;
}
