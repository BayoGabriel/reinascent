import "server-only";

import { ServiceError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { getOrderRepository } from "@/server/repositories/order.repository";
import { getProductRepository } from "@/server/repositories/product.repository";
import { getComplaintRepository } from "@/server/repositories/complaint.repository";
import {
  getUserRepository,
  type PublicUser,
} from "@/server/repositories/user.repository";
import { toOrder } from "@/server/repositories/order.repository";
import type { FulfillmentStatus, Order, PaymentStatus } from "@/features/orders/types";
import type { Role } from "@/config/permissions";
import type { ComplaintThread } from "@/features/account/types";
import type { DashboardStats } from "./types";

const DAY_MS = 86_400_000;

/** KPIs and chart series for the admin dashboard. */
export async function getDashboardStats(): Promise<DashboardStats | null> {
  const [orders, products, users, complaints] = await Promise.all([
    getOrderRepository(),
    getProductRepository(),
    getUserRepository().catch(() => null),
    getComplaintRepository(),
  ]);
  if (!orders || !products || !users || !complaints) return null;

  const now = Date.now();
  const d30 = new Date(now - 30 * DAY_MS);
  const d60 = new Date(now - 60 * DAY_MS);
  const d14 = new Date(now - 13 * DAY_MS);
  d14.setHours(0, 0, 0, 0);

  const [cur, prev, salesByDay, statusCounts, top, recent, customers, productCount, openC, pendingO] =
    await Promise.all([
      orders.salesSummary(d30, new Date()),
      orders.salesSummary(d60, d30),
      orders.dailySales(d14),
      orders.statusCounts(),
      orders.topProducts(5),
      orders.listAll({}, 6, 0),
      users.countAll(),
      products.countAll(),
      complaints.countByStatus("open"),
      orders.countAll({ paymentStatus: "pending" }),
    ]);

  return {
    revenue30d: cur.revenue,
    revenuePrev30d: prev.revenue,
    orders30d: cur.orders,
    ordersPrev30d: prev.orders,
    customersTotal: customers,
    productsTotal: productCount,
    openComplaints: openC,
    pendingOrders: pendingO,
    salesByDay,
    ordersByStatus: statusCounts,
    topProducts: top,
    recentOrders: recent.map(toOrder),
  };
}

export async function listAdminOrders(
  filter: { paymentStatus?: PaymentStatus; fulfillmentStatus?: FulfillmentStatus },
  limit = 50,
  skip = 0,
): Promise<Order[]> {
  const repo = await getOrderRepository();
  if (!repo) return [];
  const clean = Object.fromEntries(
    Object.entries(filter).filter(([, v]) => v),
  );
  return (await repo.listAll(clean, limit, skip)).map(toOrder);
}

export async function getAdminOrder(orderNumber: string): Promise<Order | null> {
  const repo = await getOrderRepository();
  if (!repo) return null;
  const doc = await repo.findByOrderNumber(orderNumber);
  return doc ? toOrder(doc) : null;
}

export async function setOrderFulfillment(
  orderNumber: string,
  status: FulfillmentStatus,
): Promise<boolean> {
  const repo = await getOrderRepository();
  if (!repo) return false;
  const ok = await repo.setFulfillment(orderNumber, status);
  if (ok) logger.info("Order fulfillment updated", { orderNumber, status });
  return ok;
}

export async function listCustomers(limit = 50, skip = 0): Promise<PublicUser[]> {
  const repo = await getUserRepository();
  return repo.listAll(limit, skip);
}

/** Guard: admins cannot suspend or demote their own account. */
function assertNotSelf(actor: PublicUser, targetId: string): void {
  if (actor._id.toHexString() === targetId) {
    throw new ServiceError("bad_request", "You cannot change your own account here.", 400);
  }
}

export async function setCustomerStatus(
  actor: PublicUser,
  targetId: string,
  status: "active" | "suspended",
): Promise<boolean> {
  assertNotSelf(actor, targetId);
  const repo = await getUserRepository();
  const ok = await repo.setStatus(targetId, status);
  if (ok) logger.info("Customer status changed", { targetId, status, by: actor._id.toHexString() });
  return ok;
}

export async function setCustomerAdmin(
  actor: PublicUser,
  targetId: string,
  makeAdmin: boolean,
): Promise<boolean> {
  assertNotSelf(actor, targetId);
  const repo = await getUserRepository();
  const target = await repo.findById(targetId);
  if (!target) return false;
  const roles: Role[] = makeAdmin
    ? ([...new Set([...target.roles, "admin" as Role])])
    : target.roles.filter((r) => r !== "admin");
  const ok = await repo.setRoles(targetId, roles.length ? roles : ["customer"]);
  if (ok) logger.warn("Admin role changed", { targetId, makeAdmin, by: actor._id.toHexString() });
  return ok;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const repo = await getProductRepository();
  if (!repo) return false;
  return repo.remove(id);
}

export async function listAllComplaints(
  status?: "open" | "solved",
): Promise<ComplaintThread[]> {
  const repo = await getComplaintRepository();
  if (!repo) return [];
  const docs = await repo.listAll(status, 100);
  return docs.map((d) => ({
    id: d._id.toHexString(),
    subject: d.subject,
    status: d.status,
    createdAt: d.createdAt.toISOString(),
    messages: d.messages.map((m) => ({
      author: m.author,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  }));
}

export async function replyToComplaint(id: string, body: string): Promise<boolean> {
  const repo = await getComplaintRepository();
  if (!repo) return false;
  return repo.addMessage(id, { author: "admin", body, createdAt: new Date() });
}

export async function setComplaintStatusAdmin(
  id: string,
  status: "open" | "solved",
): Promise<boolean> {
  const repo = await getComplaintRepository();
  if (!repo) return false;
  return repo.setStatusAny(id, status);
}
