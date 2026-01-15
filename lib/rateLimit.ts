const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const row = hits.get(key);

  if (!row || now > row.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (row.count >= limit) return { ok: false };

  row.count += 1;
  return { ok: true };
}
