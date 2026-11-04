import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";

import { AccountGreeting } from "@/features/account/components/account-greeting";
import { EmptyState } from "@/features/account/components/empty-state";
import { TransactionsTable } from "@/features/account/components/transactions-table";
import { listTransactions } from "@/features/account/service";
import { requireUser } from "@/server/auth/current-user";

export const metadata: Metadata = {
  title: "Transactions — Raina Scents",
};

export default function TransactionsPage() {
  return (
    <Suspense fallback={null}>
      <TransactionsContent />
    </Suspense>
  );
}

async function TransactionsContent() {
  await connection();
  const user = await requireUser();
  const rows = await listTransactions(user._id.toHexString());
  return (
    <div className="flex flex-col gap-8">
      <AccountGreeting title="Transactions" name={user.displayName} />
      {rows.length ? (
        <TransactionsTable rows={rows} />
      ) : (
        <EmptyState
          title="No transactions yet"
          body="Completed payments will be listed here."
          cta={{ href: "/products", label: "Browse products" }}
        />
      )}
    </div>
  );
}
