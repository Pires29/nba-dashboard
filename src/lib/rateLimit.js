import prisma from "../../prisma/prismaClient.js";
import { createHash } from "node:crypto";

const globalForRateLimit = globalThis;

if (!globalForRateLimit.__hoopiqRateLimits) {
  globalForRateLimit.__hoopiqRateLimits = new Map();
}

const buckets = globalForRateLimit.__hoopiqRateLimits;

function checkMemoryRateLimit(key, { limit, windowMs }) {
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

async function checkDatabaseRateLimit(key, { limit, windowMs }) {
  const now = new Date();
  const nextResetAt = new Date(now.getTime() + windowMs);
  const databaseKey = createHash("sha256").update(key).digest("hex");
  const [bucket] = await prisma.$queryRaw`
    INSERT INTO "RateLimitBucket" ("key", "count", "resetAt", "updatedAt")
    VALUES (${databaseKey}, 1, ${nextResetAt}, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "RateLimitBucket"."resetAt" <= ${now} THEN 1
        ELSE "RateLimitBucket"."count" + 1
      END,
      "resetAt" = CASE
        WHEN "RateLimitBucket"."resetAt" <= ${now} THEN ${nextResetAt}
        ELSE "RateLimitBucket"."resetAt"
      END,
      "updatedAt" = ${now}
    RETURNING "count", "resetAt"
  `;

  const count = Number(bucket.count);
  const resetAt = new Date(bucket.resetAt).getTime();
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfter: count <= limit
      ? 0
      : Math.max(1, Math.ceil((resetAt - now.getTime()) / 1000)),
  };
}

export async function checkRateLimit(key, options) {
  if (process.env.NODE_ENV !== "production" || !process.env.DATABASE_URL) {
    return checkMemoryRateLimit(key, options);
  }

  try {
    return await checkDatabaseRateLimit(key, options);
  } catch (error) {
    console.error("Distributed rate limit unavailable; using local fallback", {
      code: error?.code,
    });
    return checkMemoryRateLimit(key, options);
  }
}

export function rateLimitResponse(result) {
  return Response.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(result.retryAfter) } },
  );
}
