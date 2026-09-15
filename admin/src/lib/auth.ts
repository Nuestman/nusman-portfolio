import { createHash, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "desk_session";
export const PENDING_COOKIE = "desk_login_pending";
export const SESSION_DAYS = 14;
const SECRET_MIN_LENGTH = 16;
const PENDING_MINUTES = 5;

export type SessionPayload = {
  email: string;
  userId: string | null;
  sessionId: string | null;
};

export type PendingLogin = {
  email: string;
  userId: string;
};

function cookieBase() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };
}

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < SECRET_MIN_LENGTH) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() ?? "";
  const password = process.env.ADMIN_PASSWORD ?? "";
  return { email, password };
}

export function credentialsConfigured() {
  const { email, password } = getAdminCredentials();
  const secret = process.env.AUTH_SECRET ?? "";
  return Boolean(email && password && secret.length >= SECRET_MIN_LENGTH);
}

export function authSecretConfigured() {
  const secret = process.env.AUTH_SECRET ?? "";
  return secret.length >= SECRET_MIN_LENGTH;
}

export async function createSessionCookie(payload: {
  email: string;
  userId: string;
  sessionId: string;
}) {
  const token = await new SignJWT({
    email: payload.email,
    uid: payload.userId,
    sid: payload.sessionId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(getSecret());

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    ...cookieBase(),
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function readSessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token || !authSecretConfigured()) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const email = typeof payload.email === "string" ? payload.email : null;
    if (!email) {
      return null;
    }
    return {
      email,
      userId: typeof payload.uid === "string" ? payload.uid : null,
      sessionId: typeof payload.sid === "string" ? payload.sid : null,
    };
  } catch {
    return null;
  }
}

export async function getSessionPayload() {
  const jar = await cookies();
  return readSessionToken(jar.get(SESSION_COOKIE)?.value);
}

export async function getSessionEmail() {
  const session = await getSessionPayload();
  return session?.email ?? null;
}

export async function createPendingLoginCookie(payload: {
  email: string;
  userId: string;
}) {
  const token = await new SignJWT({
    email: payload.email,
    uid: payload.userId,
    pending: "totp",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PENDING_MINUTES}m`)
    .sign(getSecret());

  const jar = await cookies();
  jar.set(PENDING_COOKIE, token, {
    ...cookieBase(),
    maxAge: PENDING_MINUTES * 60,
  });
}

export async function clearPendingLogin() {
  const jar = await cookies();
  jar.delete(PENDING_COOKIE);
}

export async function readPendingLogin(): Promise<PendingLogin | null> {
  if (!authSecretConfigured()) {
    return null;
  }
  const jar = await cookies();
  const token = jar.get(PENDING_COOKIE)?.value;
  if (!token) {
    return null;
  }
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const email = typeof payload.email === "string" ? payload.email : null;
    const userId = typeof payload.uid === "string" ? payload.uid : null;
    if (!email || !userId || payload.pending !== "totp") {
      return null;
    }
    return { email, userId };
  } catch {
    return null;
  }
}

export function passwordsMatch(given: string, expected: string) {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}
