import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";

import { AccountGreeting } from "@/features/account/components/account-greeting";
import { ComplaintThreadView } from "@/features/account/components/complaint-thread";
import { EmptyState } from "@/features/account/components/empty-state";
import { NewComplaintForm } from "@/features/account/components/new-complaint-form";
import { listComplaints } from "@/features/account/complaints";
import { requireUser } from "@/server/auth/current-user";

export const metadata: Metadata = { title: "Complaints — Raina Scents" };

export default function ComplaintsPage() {
  return (
    <Suspense fallback={null}>
      <ComplaintsContent />
    </Suspense>
  );
}

async function ComplaintsContent() {
  await connection();
  const user = await requireUser();
  const threads = await listComplaints(user._id.toHexString());
  return (
    <div className="flex flex-col gap-8">
      <AccountGreeting title="Complaints" name={user.displayName} />
      {threads.length ? (
        <div>
          {threads.map((thread) => (
            <ComplaintThreadView key={thread.id} thread={thread} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No complaints"
          body="Something wrong with an order? Let us know and we'll help."
        />
      )}
      <NewComplaintForm />
    </div>
  );
}
