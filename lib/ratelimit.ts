import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  misconfigured?: boolean;
}

interface MemoryBucket {
  count: number;
  resetAt: number;
}

const memoryBuckets = new Map<string, MemoryBucket>();

function memoryLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return true;
  }

  bucket.count += 1;

  return bucket.count <= limit;
}

let redis: Redis | null = null;
let loginLimiter: Ratelimit | null = null;
let registerLimiter: Ratelimit | null = null;

function getLimiters(): {
  login: Ratelimit;
  register: Ratelimit;
} | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return null;
  }

  if (!redis) {
    redis = new Redis({
      url,
      token,
    });

    loginLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        5,
        "1 m",
      ),
      prefix: "placelove:login",
      analytics: false,
    });

    registerLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(
        5,
        "1 h",
      ),
      prefix: "placelove:register",
      analytics: false,
    });
  }

  return {
    login: loginLimiter!,
    register: registerLimiter!,
  };
}

async function checkLimit(
  limiter: Ratelimit | null,
  key: string,
  memoryLimitCount: number,
  memoryWindowMs: number,
): Promise<RateLimitResult> {
  if (limiter) {
    try {
      const result =
        await limiter.limit(key);

      return {
        success: result.success,
      };
    } catch (error) {
      console.error(
        "Upstash rate limit error:",
        error,
      );

      // В production не разрешаем запрос,
      // если центральный rate limiter недоступен.
      if (
        process.env.NODE_ENV ===
        "production"
      ) {
        return {
          success: false,
          misconfigured: true,
        };
      }

      return {
        success: memoryLimit(
          key,
          memoryLimitCount,
          memoryWindowMs,
        ),
      };
    }
  }

  // В production отсутствие Upstash —
  // fail-closed.
  if (
    process.env.NODE_ENV ===
    "production"
  ) {
    return {
      success: false,
      misconfigured: true,
    };
  }

  // В development/test используем
  // локальный fallback.
  return {
    success: memoryLimit(
      key,
      memoryLimitCount,
      memoryWindowMs,
    ),
  };
}

export async function limitLogin(
  ip: string,
  email?: string,
): Promise<RateLimitResult> {
  const limiters = getLimiters();

  const normalizedEmail =
    email?.trim().toLowerCase() ||
    "unknown";

  const key =
    `${ip}:login:${normalizedEmail}`;

  return checkLimit(
    limiters?.login ?? null,
    key,
    5,
    60_000,
  );
}

export async function limitRegister(
  ip: string,
  email?: string,
): Promise<RateLimitResult> {
  const limiters = getLimiters();

  const normalizedEmail =
    email?.trim().toLowerCase() ||
    "unknown";

  const key =
    `${ip}:register:${normalizedEmail}`;

  return checkLimit(
    limiters?.register ?? null,
    key,
    5,
    60 * 60_000,
  );
}

export function getClientIp(
  request: Request,
): string {
  const forwarded =
    request.headers.get(
      "x-forwarded-for",
    );

  if (forwarded) {
    const firstIp = forwarded
      .split(",")[0]
      ?.trim();

    if (firstIp) {
      return firstIp;
    }
  }

  const realIp =
    request.headers
      .get("x-real-ip")
      ?.trim();

  return realIp || "unknown";
}