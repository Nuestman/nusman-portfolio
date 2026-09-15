const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

const attempts = new Map<string, { count: number; resetAt: number }>();

function bucket(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    const next = { count: 0, resetAt: now + WINDOW_MS };
    attempts.set(key, next);
    return next;
  }
  return current;
}

export function loginIsBlocked(key: string): boolean {
  return bucket(key).count >= MAX_ATTEMPTS;
}

export function recordLoginFailure(key: string) {
  const current = bucket(key);
  current.count += 1;
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}
