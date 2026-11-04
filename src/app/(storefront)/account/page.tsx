import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";

import { AccountGreeting } from "@/features/account/components/account-greeting";
import { EmptyState } from "@/features/account/components/empty-state";
import { OrdersTable } from "@/features/account/components/orders-table";
import { listUserOrders } from "@/features/account/service";
import { requireUser } from "@/server/auth/current-user";

export const metadata: Metadata = { title: "My Account — Raina Scents" };

export default function AccountDashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  await connection();
  const user = await requireUser();
  const orders = await listUserOrders(user._id.toHexString(), 5);
  return (
    <div className="flex flex-col gap-8">
      <AccountGreeting title="Dashboard" name={user.displayName} />
      <section>
        <h3 className="mb-2 text-sm font-semibold text-[#1F253F]">Recent Orders</h3>
        {orders.length ? (
          <OrdersTable orders={orders} />
        ) : (
          <EmptyState
            title="No orders yet"
            body="When you place an order it will show up here."
            cta={{ href: "/products", label: "Start shopping" }}
          />
        )}
      </section>
    </div>
  );
}
