import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductDetail } from "./ProductDetail";
import { getProductBySlug } from "@/features/products/service";

type Props = PageProps<"/products/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return product ? { title: `${product.name} — Raina Scents` } : {};
}

/** Dynamic segment — params/data work streams inside a Suspense hole. */
export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={null}>
      <ProductDetail params={params} />
    </Suspense>
  );
}
