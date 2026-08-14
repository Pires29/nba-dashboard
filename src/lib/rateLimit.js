const globalForRateLimit = globalThis;

if (!globalForRateLimit.__hoopiqRateLimits) {
  globalForRateLimit.__hoopiqRateLimits = new Map();
}

const buckets = globalForRateLimit.__hoopiqRateLimits;

export function checkRateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  current.count += 1;
  if (current.count > limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  return { allowed: true, remaining: limit - current.count, retryAfter: 0 };
}

export function rateLimitResponse(result) {
  return Response.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
  );
}

