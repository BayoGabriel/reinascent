import { updateProduct } from "@/features/products/service";
import { productUpdateSchema } from "@/features/products/schema";
import { apiGuard } from "@/server/auth/api-guard";
import { fail, ok, readJson, validationMessage } from "@/lib/api-response";

type Ctx = RouteContext<"/api/admin/products/[id]">;

export async function PATCH(request: Request, ctx: Ctx) {
  const denied = await apiGuard(request, "catalog:manage");
  if (denied) return denied;
  const { id } = await ctx.params;
  const parsed = productUpdateSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    return fail(400, "bad_request", validationMessage(parsed.error));
  }
  const res = await updateProduct(id, parsed.data);
  return res.ok ? ok(res.data) : fail(res.status, res.code, res.message);
}
