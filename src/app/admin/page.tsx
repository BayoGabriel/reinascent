import { Suspense } from "react";
import { connection } from "next/server";
import Link from "next/link";
import type { Metadata } from "next";

import { Icon } from "@/components/ui/Icon";
import { formatPrice } from "@/lib/money";
import { PageHeader } from "@/features/admin/components/page-header";
import { StatCard } from "@/features/admin/components/stat-card";
import { RevenueChart } from "@/features/admin/components/revenue-chart";
import { StatusDonut } from "@/features/admin/components/status-donut";
import { getDashboardStats } from "@/features/admin/service";
import { StatusBadge } from "@/features/account/components/status-badge";

export const metadata: Metadata = { title: "Dashboard — Raina Scents Admin" };

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

function delta(cur: number, prev: number): number | null {
  if (!prev) return cur > 0 ? 100 : null;
  return ((cur - prev) / prev) * 100;
}

async function DashboardContent() {
  await connection();
  const stats = await getDashboardStats();
  if (!stats) {
    return <p className="text-sm text-cocoa">Database unavailable.</p>;
  }
  const chartData = stats.salesByDay.length
    ? stats.salesByDay
    : [{ date: new Date().toISOString().slice(0, 10), total: 0, count: 0 }];
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Store performance at a glance."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue (30d)"
          value={formatPrice(stats.revenue30d)}
          icon="trendingUp"
          delta={delta(stats.revenue30d, stats.revenuePrev30d)}
        />
        <StatCard
          label="Orders (30d)"
          value={String(stats.orders30d)}
          icon="cart"
          delta={delta(stats.orders30d, stats.ordersPrev30d)}
        />
        <StatCard
          label="Customers"
          value={String(stats.customersTotal)}
          icon="user"
        />
        <StatCard
          label="Products"
          value={String(stats.productsTotal)}
          icon="box"
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm xl:col-span-2">
          <h2 className="text-sm font-semibold text-[#1F253F]">Revenue — last 14 days</h2>
          <div className="mt-4">
            <RevenueChart data={chartData} />
          </div>
        </section>
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#1F253F]">Order status</h2>
          <div className="mt-4">
            <StatusDonut counts={stats.ordersByStatus} />
          </div>
          <div className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
            <Link href="/admin/orders?payment=pending" className="flex justify-between text-cocoa hover:text-[#1F253F]">
              <span>Awaiting payment</span>
              <span className="font-medium text-[#1F253F]">{stats.pendingOrders}</span>
            </Link>
            <Link href="/admin/complaints" className="flex justify-between text-cocoa hover:text-[#1F253F]">
              <span>Open complaints</span>
              <span className="font-medium text-[#1F253F]">{stats.openComplaints}</span>
            </Link>
          </div>
        </section>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#1F253F]">Recent orders</h2>
            <Link href="/admin/orders" className="text-xs font-medium text-gold hover:text-cocoa">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {stats.recentOrders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/orders/${o.orderNumber}`}
                  className="flex items-center gap-3 py-3 hover:bg-cream/40"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1F253F]">{o.orderNumber}</p>
                    <p className="truncate text-xs text-cocoa/70">{o.customer.name}</p>
                  </div>
                  <StatusBadge status={o.paymentStatus} />
                  <StatusBadge status={o.fulfillmentStatus} />
                  <span className="w-20 text-right text-sm font-medium text-[#1F253F]">
                    {formatPrice(o.total)}
                  </span>
                  <Icon name="chevronRight" className="size-4 text-cocoa/40" />
                </Link>
              </li>
            ))}
            {!stats.recentOrders.length && (
              <li className="py-6 text-center text-sm text-cocoa/70">No orders yet.</li>
            )}
          </ul>
        </section>
        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-[#1F253F]">Top products</h2>
          <ul className="space-y-3">
            {stats.topProducts.map((p, i) => {
              const max = stats.topProducts[0]?.qty || 1;
              return (
                <li key={p.slug}>
                  <div className="flex justify-between text-sm">
                    <span className="truncate text-[#1F253F]">{i + 1}. {p.name}</span>
                    <span className="ml-2 shrink-0 font-medium text-cocoa">{p.qty} sold</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-cream">
                    <div
                      className="h-full rounded-full bg-gold"
                      style={{ width: `${(p.qty / max) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
            {!stats.topProducts.length && (
              <li className="py-4 text-center text-sm text-cocoa/70">No sales data yet.</li>
            )}
          </ul>
        </section>
      </div>
    </>
  );
}
