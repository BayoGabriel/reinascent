import { listProducts } from "@/features/products/service";
import { ok } from "@/lib/api-response";

/** Public: active catalog products, featured first. */
export async function GET() {
  return ok(await listProducts());
}
