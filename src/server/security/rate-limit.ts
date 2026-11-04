/**
 * Rate limiting for abuse-prone operations (sign-in, registration, guest
 * checkout later). The in-memory implementation is suitable for a single
 * dev/instance process ONLY — it does not coordinate across replicas.
 *
 * Production deployments MUST swap inRateLimiter for a shared store
 * implementation (e.g. Redis/Upstash sliding window) via the same contract.
 */
export interface RateLimiter {
  /**
   * Consume one attempt for `key`. Returns true when allowed, false when the
   * caller exceeded `limit` attempts inside `windowMs`.
   */
  consume(key: string, limit: number, windowMs: number): boolean;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export class InMemoryRateLimiter implements RateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly maxBuckets = 10_000;

  consume(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      this.evictIfNeeded();
      this.buckets.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }
    bucket.count += 1;
    return bucket.count <= limit;
  }

  private evictIfNeeded(): void {
    if (this.buckets.size < this.maxBuckets) return;
    const now = Date.now();
    for (const [key, bucket] of this.buckets) {
      if (bucket.resetAt <= now) this.buckets.delete(key);
    }
  }
}

export const rateLimiter: RateLimiter = new InMemoryRateLimiter();

/** Extract a best-effort client IP for rate-limit keys. */
export function rateLimitKey(
  prefix: string,
  forwardedFor: string | null,
): string {
  const ip = forwardedFor?.split(",")[0]?.trim() || "unknown";
  return `${prefix}:${ip}`;
}
