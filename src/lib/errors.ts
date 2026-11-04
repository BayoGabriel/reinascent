/**
 * Safe error envelope for Route Handlers. Internal details must never
 * reach the client: no stack traces, database errors, or credentials.
 */
export type ApiErrorCode =
  | "bad_request"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "rate_limited"
  | "internal";

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export function apiError(code: ApiErrorCode, message: string): ApiErrorBody {
  return { error: { code, message } };
}

/** Thrown inside services to signal a safe, user-facing failure. */
export class ServiceError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string, status = 400) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.status = status;
  }
}
