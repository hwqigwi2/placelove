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

function checkMemoryLimit(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  cleanup();

  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  existing.count += 1;
  return existing.count <= limit;
}

/**
 * Telegram auth: максимум 12 запросов в минуту на IP.
 * Нагрузка крошечная (единичные пользователи в день), in-memory лимитера
 * достаточно; реальная защита — HMAC-валидация initData на сервере.
 */
export function limitTelegramAuth(ip: string): boolean {
  return checkMemoryLimit(`tg-auth:${ip}`, 12, 60_000);
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const firstIp = forwarded.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp || "unknown";
}
