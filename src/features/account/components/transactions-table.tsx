import Link from "next/link";

import { formatPrice } from "@/lib/money";
import type { TransactionRow } from "../types";
import { StatusBadge } from "./status-badge";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

/** Ledger of successful payments, newest first. */
export function TransactionsTable({ rows }: { rows: TransactionRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-cocoa/60">
            <th className="py-3 pr-4 font-medium">Date</th>
            <th className="py-3 pr-4 font-medium">Order</th>
            <th className="py-3 pr-4 font-medium">Method</th>
            <th className="py-3 pr-4 font-medium">Reference</th>
            <th className="py-3 pr-4 font-medium">Status</th>
            <th className="py-3 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.reference} className="text-[#1F253F]">
              <td className="py-3.5 pr-4 text-cocoa">{formatDate(row.paidAt)}</td>
              <td className="py-3.5 pr-4">
                <Link
                  href={`/orders/${row.orderNumber}`}
                  className="font-medium underline-offset-2 hover:underline"
                >
                  {row.orderNumber}
                </Link>
              </td>
              <td className="py-3.5 pr-4 capitalize text-cocoa">
                {row.method}
                {row.channel ? ` — ${row.channel}` : ""}
              </td>
              <td className="max-w-40 truncate py-3.5 pr-4 font-mono text-xs text-cocoa/80">
                {row.reference}
              </td>
              <td className="py-3.5 pr-4">
                <StatusBadge status="paid" />
              </td>
              <td className="py-3.5 text-right font-medium">
                {formatPrice(row.total)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
