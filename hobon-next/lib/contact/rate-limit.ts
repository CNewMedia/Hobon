const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();

/** Simple in-memory rate limit per IP (best-effort on serverless). */
export function checkRateLimit(ip: string): boolean {
  const key = ip || "unknown";
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false;
  }

  entry.count += 1;
  return true;
}
