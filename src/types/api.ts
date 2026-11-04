import type { ApiErrorCode } from "@/lib/errors";

/** Shared API envelope types for public Route Handlers. */
export interface ApiSuccess<T> {
  data: T;
}

export interface ApiFailure {
  error: {
    code: string;
    message: string;
  };
}

/** Service-layer result union: callers translate it into safe responses. */
export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; code: ApiErrorCode; message: string };

export function serviceUnavailable<T>(): ServiceResult<T> {
  return {
    ok: false,
    status: 503,
    code: "internal",
    message: "Service temporarily unavailable.",
  };
}

export function notFound<T>(what = "Resource"): ServiceResult<T> {
  return { ok: false, status: 404, code: "not_found", message: `${what} not found.` };
}
