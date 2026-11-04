import { cacheLife, cacheTag, revalidateTag } from "next/cache";
import { getProductRepository } from "@/server/repositories/product.repository";
import { notFound, serviceUnavailable, type ServiceResult } from "@/types/api";
import { fallbackProducts } from "./seed";
import type { ProductInput, ProductUpdate } from "./schema";
import type { Product } from "./types";

const TAG = "products";

function withIds(products: Omit<Product, "id" | "createdAt" | "updatedAt">[]): Product[] {
  return products.map((p, i) => ({ ...p, id: `seed-${i}`, createdAt: "", updatedAt: "" }));
}

/** Catalog products — DB is authoritative when reachable, seeds otherwise. */
export async function listProducts(limit = 60): Promise<Product[]> {
  "use cache";
  cacheTag(TAG);
  cacheLife("minutes");
  const repo = await getProductRepository();
  if (!repo) return withIds(fallbackProducts);
  return repo.listActive(limit);
}

export async function listFeaturedProducts(limit = 8): Promise<Product[]> {
  "use cache";
  cacheTag(TAG);
  cacheLife("minutes");
  const repo = await getProductRepository();
  if (!repo) return withIds(fallbackProducts).filter((p) => p.isFeatured);
  return repo.listFeatured(limit);
}

export async function listNewArrivals(limit = 3): Promise<Product[]> {
  "use cache";
  cacheTag(TAG);
  cacheLife("minutes");
  const repo = await getProductRepository();
  if (repo) return repo.listNewest(limit);
  const seeds = withIds(fallbackProducts);
  const fresh = seeds.filter((p) => p.badge === "New Arrival");
  return [...fresh, ...seeds.filter((p) => p.badge !== "New Arrival")].slice(
    0,
    limit,
  );
}

export async function listSaleProducts(limit = 48): Promise<Product[]> {
  "use cache";
  cacheTag(TAG);
  cacheLife("minutes");
  const repo = await getProductRepository();
  if (!repo)
    return withIds(fallbackProducts).filter(
      (p) => p.badge === "Sale" || p.compareAtPrice != null,
    );
  return repo.listOnSale(limit);
}

/** Products for the given slugs, preserving order; seeds hydrate missing slugs. */
export async function getProductsBySlugs(slugs: string[]): Promise<Product[]> {
  "use cache";
  cacheTag(TAG);
  cacheLife("minutes");
  const repo = await getProductRepository();
  const found = repo ? await repo.findBySlugs(slugs) : [];
  const have = new Set(found.map((p) => p.slug));
  const seeds = withIds(fallbackProducts).filter(
    (p) => slugs.includes(p.slug) && !have.has(p.slug),
  );
  return [...found, ...seeds];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheTag(TAG);
  cacheLife("minutes");
  const repo = await getProductRepository();
  if (repo) {
    const product = await repo.findBySlug(slug);
    if (product) return product;
  }
  return withIds(fallbackProducts).find((p) => p.slug === slug) ?? null;
}

export async function listAllProducts(): Promise<Product[] | null> {
  const repo = await getProductRepository();
  return repo ? repo.listAll() : null;
}

export async function createProduct(
  input: ProductInput,
): Promise<ServiceResult<Product>> {
  const repo = await getProductRepository();
  if (!repo) return serviceUnavailable();
  const data = await repo.create(input);
  revalidateTag(TAG, "max");
  return { ok: true, data };
}

export async function updateProduct(
  id: string,
  patch: ProductUpdate,
): Promise<ServiceResult<Product>> {
  const repo = await getProductRepository();
  if (!repo) return serviceUnavailable();
  const data = await repo.update(id, patch);
  if (!data) return notFound("Product");
  revalidateTag(TAG, "max");
  return { ok: true, data };
}
