import { getSiteSettings } from "@/features/settings/service";
import { ok } from "@/lib/api-response";

/** Public: brand info + navigation links for storefront chrome. */
export async function GET() {
  return ok(await getSiteSettings());
}
