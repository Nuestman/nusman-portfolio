const WINDOW_MS = 60 * 60 * 1000;
const MAX_ATTEMPTS = 8;
const MAX_KEYS = 2000;

const attempts = new Map<string, { count: number; resetAt: number }>();

function pruneExpired(now: number) {
  if (attempts.size < MAX_KEYS) {
    return;
  }
  for (const [key, value] of attempts) {
    if (value.resetAt <= now) {
      attempts.delete(key);
    }
  }
  if (attempts.size >= MAX_KEYS) {
    attempts.clear();
  }
}

function bucket(key: string) {
  const now = Date.now();
  pruneExpired(now);
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    const next = { count: 0, resetAt: now + WINDOW_MS };
    attempts.set(key, next);
    return next;
  }
  return current;
}

export function inboundIsBlocked(key: string): boolean {
  return bucket(key).count >= MAX_ATTEMPTS;
}

export function recordInboundAttempt(key: string) {
  const current = bucket(key);
  current.count += 1;
}
