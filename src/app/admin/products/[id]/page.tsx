import { Suspense } from "react";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { listAllProducts } from "@/features/products/service";
import { PageHeader } from "@/features/admin/components/page-header";
import { ProductForm } from "@/features/admin/components/product-form";

export const metadata: Metadata = { title: "Edit Product — Raina Scents Admin" };

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <EditContent params={params} />
    </Suspense>
  );
}

async function EditContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const product = (await listAllProducts())?.find((p) => p.id === id);
  if (!product) notFound();
  return (
    <>
      <PageHeader title={product.name} description={`Editing /products/${product.slug}`} />
      <ProductForm product={product} />
    </>
  );
}
