import { apiError, type ApiErrorCode } from "@/lib/errors";
import type { ApiSuccess } from "@/types/api";

/** Consistent envelopes: `{ data }` on success, `{ error }` on failure. */
export function ok<T>(data: T, init?: ResponseInit): Response {
  const body: ApiSuccess<T> = { data };
  return Response.json(body, init);
}

export function fail(status: number, code: ApiErrorCode, message: string): Response {
  return Response.json(apiError(code, message), { status });
}

export async function readJson(request: Request): Promise<unknown | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/** First lines of a zod error, flattened for a safe client message. */
export function validationMessage(error: { issues: { message: string }[] }): string {
  const msg = error.issues
    .slice(0, 3)
    .map((i) => i.message)
    .join("; ");
  return msg || "Invalid request body.";
}
