import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";

import { PageHeader } from "@/features/admin/components/page-header";
import { listCustomers } from "@/features/admin/service";
import {
  setCustomerAdminAction,
  setCustomerStatusAction,
} from "@/features/admin/actions";
import { requireAdmin } from "@/server/auth/current-user";

export const metadata: Metadata = { title: "Customers — Raina Scents Admin" };

export default function AdminCustomersPage() {
  return (
    <Suspense fallback={null}>
      <CustomersContent />
    </Suspense>
  );
}

const mini =
  "rounded-full border px-3 py-1 text-xs font-medium transition-colors";

async function CustomersContent() {
  await connection();
  const admin = await requireAdmin();
  const users = await listCustomers(100);
  return (
    <>
      <PageHeader title="Customers" description={`${users.length} accounts`} />
      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full min-w-[46rem] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-cocoa/60">
              <th className="px-5 py-3.5 font-medium">Customer</th>
              <th className="px-4 py-3.5 font-medium">Roles</th>
              <th className="px-4 py-3.5 font-medium">Status</th>
              <th className="px-4 py-3.5 font-medium">Joined</th>
              <th className="px-5 py-3.5 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => {
              const id = u._id.toHexString();
              const isSelf = admin?._id.toHexString() === id;
              const suspended = u.status === "suspended";
              const isAdmin = u.roles.includes("admin");
              return (
                <tr key={id} className="transition-colors hover:bg-cream/40">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-[#1F253F]">
                      {u.displayName || "—"}
                      {isSelf && <span className="ml-2 text-xs text-cocoa/50">(you)</span>}
                    </p>
                    <p className="text-xs text-cocoa/60">{u.email}</p>
                  </td>
                  <td className="px-4 py-3.5 text-cocoa">{u.roles.join(", ")}</td>
                  <td className="px-4 py-3.5">
                    <span className={suspended ? "text-red-600" : "text-emerald-600"}>
                      {suspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-cocoa">
                    {u.createdAt ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" }).format(new Date(u.createdAt)) : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    {!isSelf && (
                      <div className="flex justify-end gap-2">
                        <form action={setCustomerStatusAction.bind(null, id, suspended ? "active" : "suspended")}>
                          <button className={`${mini} ${suspended ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50" : "border-red-200 text-red-600 hover:bg-red-50"}`}>
                            {suspended ? "Reactivate" : "Suspend"}
                          </button>
                        </form>
                        <form action={setCustomerAdminAction.bind(null, id, !isAdmin)}>
                          <button className={`${mini} border-line text-cocoa hover:border-gold hover:text-gold`}>
                            {isAdmin ? "Revoke admin" : "Make admin"}
                          </button>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {!users.length && (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-cocoa/70">No customers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
