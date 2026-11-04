import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import type { Metadata } from "next";

import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";
import { PageHeader } from "@/features/admin/components/page-header";
import { ComplaintReply } from "@/features/admin/components/complaint-reply";
import { listAllComplaints } from "@/features/admin/service";
import { setComplaintStatusAdminAction } from "@/features/admin/actions";

export const metadata: Metadata = { title: "Complaints — Raina Scents Admin" };

export default function AdminComplaintsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <Suspense fallback={null}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}

function fmt(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(iso));
}

async function Content({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await connection();
  const sp = await searchParams;
  const filter = sp.status === "open" || sp.status === "solved" ? sp.status : undefined;
  const threads = await listAllComplaints(filter);
  return (
    <>
      <PageHeader title="Complaints" description={`${threads.length} threads`} />
      <div className="mb-5 flex gap-2">
        {["", "open", "solved"].map((s) => (
          <Link
            key={s}
            href={s ? `/admin/complaints?status=${s}` : "/admin/complaints"}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm capitalize transition-colors",
              (filter ?? "") === s
                ? "bg-ink text-white"
                : "border border-line text-cocoa hover:border-cocoa/40",
            )}
          >
            {s || "All"}
          </Link>
        ))}
      </div>
      <div className="space-y-4">
        {threads.map((t) => (
          <article key={t.id} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-sm font-semibold text-[#1F253F]">
                  <Icon name="info" className={cn("size-4.5", t.status === "solved" ? "text-emerald-500" : "text-red-500")} />
                  {t.subject}
                </h2>
                <p className="mt-1 text-xs text-cocoa/60">Opened {fmt(t.createdAt)}</p>
              </div>
              <form action={setComplaintStatusAdminAction.bind(null, t.id, t.status === "solved" ? "open" : "solved")}>
                <button className="rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-cocoa transition-colors hover:border-gold hover:text-gold">
                  {t.status === "solved" ? "Reopen" : "Mark solved"}
                </button>
              </form>
            </div>
            <div className="mt-4 space-y-3">
              {t.messages.map((m, i) => (
                <div key={i} className={cn("rounded-xl px-4 py-3 text-sm", m.author === "admin" ? "ml-8 bg-cream/70" : "bg-white ring-1 ring-line")}>
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-cocoa/60">
                    {m.author === "admin" ? "Admin" : "Customer"} · {fmt(m.createdAt)}
                  </p>
                  <p className="text-[#1F253F]/90">{m.body}</p>
                </div>
              ))}
            </div>
            <ComplaintReply id={t.id} />
          </article>
        ))}
        {!threads.length && (
          <p className="rounded-2xl border border-dashed border-line py-12 text-center text-sm text-cocoa/70">
            No complaints{filter ? ` marked ${filter}` : ""}.
          </p>
        )}
      </div>
    </>
  );
}
