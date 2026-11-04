"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requirePermission } from "@/server/auth/current-user";
import type { Permission } from "@/config/permissions";
import { siteSettingsSchema } from "@/features/settings/schema";
import { updateSiteSettings } from "@/features/settings/service";
import {
  createAnnouncement,
  deleteAnnouncement,
  updateAnnouncement,
} from "@/features/announcements/service";
import { announcementInputSchema } from "@/features/announcements/schema";
import { upsertSection } from "@/features/content-management/service";
import { updateProduct, createProduct } from "@/features/products/service";
import { productUpsertSchema } from "@/features/products/schema";
import {
  deleteProduct,
  replyToComplaint,
  setComplaintStatusAdmin,
  setCustomerAdmin,
  setCustomerStatus,
  setOrderFulfillment,
} from "./service";
import type { AdminFormState } from "./types";

const DENIED: AdminFormState = { message: "You do not have permission." };

async function guard(permission: Permission) {
  return requirePermission(permission);
}

export async function setOrderStatusAction(
  orderNumber: string,
  status: "unfulfilled" | "fulfilled" | "cancelled",
): Promise<void> {
  if (!(await guard("orders:manage"))) return;
  await setOrderFulfillment(orderNumber, status);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath("/admin");
}

export async function setCustomerStatusAction(
  targetId: string,
  status: "active" | "suspended",
): Promise<void> {
  const actor = await guard("customers:manage");
  if (!actor) return;
  await setCustomerStatus(actor, targetId, status);
  revalidatePath("/admin/customers");
}

export async function setCustomerAdminAction(
  targetId: string,
  makeAdmin: boolean,
): Promise<void> {
  const actor = await guard("customers:manage");
  if (!actor) return;
  await setCustomerAdmin(actor, targetId, makeAdmin);
  revalidatePath("/admin/customers");
}

export async function deleteProductAction(id: string): Promise<void> {
  if (!(await guard("catalog:manage"))) return;
  await deleteProduct(id);
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}

const productFormSchema = productUpsertSchema;

export async function saveProductAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await guard("catalog:manage"))) return DENIED;
  const raw = formData.get("payload");
  if (typeof raw !== "string") return { message: "Invalid submission." };
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { message: "Invalid product data." };
  }
  const parsed = productFormSchema.safeParse(json);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const id = formData.get("id");
  const res =
    typeof id === "string" && id
      ? await updateProduct(id, parsed.data)
      : await createProduct(parsed.data);
  if (!res.ok) return { message: res.message };
  revalidatePath("/admin/products");
  revalidatePath("/admin");
  return { ok: true, message: "Product saved." };
}

export async function replyComplaintAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await guard("customers:manage"))) return DENIED;
  const id = String(formData.get("id") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 2 || body.length > 2000) {
    return { fieldErrors: { body: ["Reply must be 2–2000 characters."] } };
  }
  if (!(await replyToComplaint(id, body))) {
    return { message: "Could not send the reply." };
  }
  revalidatePath("/admin/complaints");
  return { ok: true, message: "Reply sent." };
}

export async function setComplaintStatusAdminAction(
  id: string,
  status: "open" | "solved",
): Promise<void> {
  if (!(await guard("customers:manage"))) return;
  await setComplaintStatusAdmin(id, status);
  revalidatePath("/admin/complaints");
}

const settingsFormSchema = siteSettingsSchema;

export async function saveSettingsAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await guard("settings:manage"))) return DENIED;
  const raw = formData.get("payload");
  if (typeof raw !== "string") return { message: "Invalid submission." };
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { message: "Invalid settings data." };
  }
  const parsed = settingsFormSchema.safeParse(json);
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const res = await updateSiteSettings(parsed.data);
  if (!res.ok) return { message: res.message };
  revalidatePath("/admin");
  return { ok: true, message: "Settings saved." };
}

export async function saveAnnouncementAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await guard("content:manage"))) return DENIED;
  const parsed = announcementInputSchema.safeParse({
    text: formData.get("text"),
    href: formData.get("href") || "",
    variant: formData.get("variant") || "default",
    icon: formData.get("icon") || "none",
    isActive: true,
    order: Number(formData.get("order") ?? 0) || 0,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const res = await createAnnouncement(parsed.data);
  if (!res.ok) return { message: res.message };
  revalidatePath("/admin/content");
  return { ok: true, message: "Announcement created." };
}

export async function toggleAnnouncementAction(
  id: string,
  isActive: boolean,
): Promise<void> {
  if (!(await guard("content:manage"))) return;
  await updateAnnouncement(id, { isActive });
  revalidatePath("/admin/content");
}

export async function deleteAnnouncementAction(id: string): Promise<void> {
  if (!(await guard("content:manage"))) return;
  await deleteAnnouncement(id);
  revalidatePath("/admin/content");
}

const sectionSchema = z.object({
  key: z.string().trim().min(1).max(120),
  type: z.enum([
    "hero",
    "promo_banner",
    "featured_products",
    "category_grid",
    "rich_text",
    "faq",
    "about_page",
  ]),
  status: z.enum(["draft", "published"]),
  data: z.string().min(1),
});

export async function saveSectionAction(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await guard("content:manage"))) return DENIED;
  const parsed = sectionSchema.safeParse({
    key: formData.get("key"),
    type: formData.get("type"),
    status: formData.get("status"),
    data: formData.get("data"),
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }
  let data: unknown;
  try {
    data = JSON.parse(parsed.data.data);
  } catch {
    return { fieldErrors: { data: ["Data must be valid JSON."] } };
  }
  const res = await upsertSection(parsed.data.key, {
    type: parsed.data.type,
    status: parsed.data.status,
    data,
  });
  if (!res.ok) return { message: res.message };
  revalidatePath("/admin/content");
  return { ok: true, message: "Section saved." };
}
