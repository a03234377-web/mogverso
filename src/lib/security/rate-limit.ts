type Bucket = { count: number; resetAt: number };

const memoryStore = new Map<string, Bucket>();

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const bucket = memoryStore.get(key);

  if (!bucket || bucket.resetAt <= now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

async function upstashRateLimit(
  key: string,
  limit: number,
  windowSec: number,
): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    return memoryRateLimit(key, limit, windowSec * 1000);
  }

  const res = await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(4000),
  });

  if (!res.ok) {
    return memoryRateLimit(key, limit, windowSec * 1000);
  }

  const count = Number(await res.text());
  if (count === 1) {
    await fetch(`${url}/expire/${encodeURIComponent(key)}/${windowSec}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    }).catch(() => undefined);
  }

  if (count > limit) {
    return { allowed: false, retryAfterSec: windowSec };
  }

  return { allowed: true };
}

export async function checkRateLimit(
  scope: string,
  ip: string,
  limit: number,
  windowSec: number,
): Promise<{ allowed: boolean; retryAfterSec?: number }> {
  const key = `rl:${scope}:${ip}`;
  return upstashRateLimit(key, limit, windowSec);
}
