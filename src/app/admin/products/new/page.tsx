import type { Metadata } from "next";

import { PageHeader } from "@/features/admin/components/page-header";
import { ProductForm } from "@/features/admin/components/product-form";

export const metadata: Metadata = { title: "New Product — Raina Scents Admin" };

export default function NewProductPage() {
  return (
    <>
      <PageHeader title="New product" description="Add a product to the catalog." />
      <ProductForm product={null} />
    </>
  );
}
