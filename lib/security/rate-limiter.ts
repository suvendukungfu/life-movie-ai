interface RateLimitRecord {
  count: number;
  resetAt: number;
}

class TokenBucketRateLimiter {
  private records = new Map<string, RateLimitRecord>();

  /**
   * Checks whether the client or user is within rate limit bounds.
   * @param key - IP address or userId
   * @param limit - Maximum allowed requests in window
   * @param windowMs - Time window in milliseconds (default 60s)
   */
  check(key: string, limit: number = 30, windowMs: number = 60000): { allowed: boolean; remaining: number; resetInSec: number } {
    const now = Date.now();
    const record = this.records.get(key);

    if (!record || now > record.resetAt) {
      this.records.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1, resetInSec: Math.ceil(windowMs / 1000) };
    }

    if (record.count >= limit) {
      const resetInSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
      return { allowed: false, remaining: 0, resetInSec };
    }

    record.count += 1;
    return {
      allowed: true,
      remaining: limit - record.count,
      resetInSec: Math.ceil((record.resetAt - now) / 1000),
    };
  }
}

export const rateLimiter = new TokenBucketRateLimiter();
