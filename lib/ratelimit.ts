interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const CLEANUP_INTERVAL = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();

  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return;
  }

  lastCleanup = now;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export interface RateLimitResult {
  success: boolean;
  misconfigured?: boolean;
}

function checkMemoryLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  cleanup();

  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      success: true,
    };
  }

  existing.count += 1;

  return {
    success: existing.count <= limit,
  };
}

/**
 * Login:
 * максимум 5 попыток в минуту
 * на комбинацию IP + email.
 */
export async function limitLogin(
  ip: string,
  email?: string,
): Promise<RateLimitResult> {
  const normalizedEmail =
    email?.trim().toLowerCase() || "unknown";

  return checkMemoryLimit(
    `login:${ip}:${normalizedEmail}`,
    5,
    60_000,
  );
}

/**
 * Registration:
 * максимум 5 попыток в час
 * на комбинацию IP + email.
 */
export async function limitRegister(
  ip: string,
  email?: string,
): Promise<RateLimitResult> {
  const normalizedEmail =
    email?.trim().toLowerCase() || "unknown";

  return checkMemoryLimit(
    `register:${ip}:${normalizedEmail}`,
    5,
    60 * 60_000,
  );
}

export function getClientIp(
  request: Request,
): string {
  const forwarded =
    request.headers.get("x-forwarded-for");

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