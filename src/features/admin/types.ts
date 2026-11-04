import type { Order } from "@/features/orders/types";

/** Result envelope returned by admin Server Actions to form components. */
export interface AdminFormState {
  message?: string;
  ok?: boolean;
  fieldErrors?: Record<string, string[]>;
}

export interface DashboardStats {
  revenue30d: number;
  revenuePrev30d: number;
  orders30d: number;
  ordersPrev30d: number;
  customersTotal: number;
  productsTotal: number;
  openComplaints: number;
  pendingOrders: number;
  salesByDay: { date: string; total: number; count: number }[];
  ordersByStatus: Record<string, number>;
  topProducts: { slug: string; name: string; qty: number; revenue: number }[];
  recentOrders: Order[];
}
