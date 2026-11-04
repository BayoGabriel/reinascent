import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";

import { AccountGreeting } from "@/features/account/components/account-greeting";
import { EmptyState } from "@/features/account/components/empty-state";
import { OrdersTable } from "@/features/account/components/orders-table";
import { listUserOrders } from "@/features/account/service";
import { requireUser } from "@/server/auth/current-user";

export const metadata: Metadata = { title: "Orders — Raina Scents" };

export default function AccountOrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersContent />
    </Suspense>
  );
}

async function OrdersContent() {
  await connection();
  const user = await requireUser();
  const orders = await listUserOrders(user._id.toHexString());
  return (
    <div className="flex flex-col gap-8">
      <AccountGreeting title="Orders" name={user.displayName} />
      {orders.length ? (
        <OrdersTable orders={orders} />
      ) : (
        <EmptyState
          title="No orders yet"
          body="Your order history will appear here after checkout."
          cta={{ href: "/products", label: "Browse products" }}
        />
      )}
    </div>
  );
}
