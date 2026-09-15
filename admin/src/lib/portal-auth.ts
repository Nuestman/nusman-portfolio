import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const PORTAL_SESSION_COOKIE = "portal_session";
export const PORTAL_SESSION_DAYS = 14;
const SECRET_MIN_LENGTH = 16;

export type PortalSessionPayload = {
  personId: string;
  sessionId: string;
};

export function portalSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PORTAL_SESSION_DAYS * 24 * 60 * 60,
  };
}

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < SECRET_MIN_LENGTH) {
    throw new Error("AUTH_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

function authSecretConfigured() {
  const secret = process.env.AUTH_SECRET ?? "";
  return secret.length >= SECRET_MIN_LENGTH;
}

export async function signPortalSessionToken(payload: {
  personId: string;
  sessionId: string;
}) {
  return new SignJWT({
    pid: payload.personId,
    sid: payload.sessionId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${PORTAL_SESSION_DAYS}d`)
    .sign(getSecret());
}

export async function createPortalSessionCookie(payload: {
  personId: string;
  sessionId: string;
}) {
  const token = await signPortalSessionToken(payload);
  const jar = await cookies();
  jar.set(PORTAL_SESSION_COOKIE, token, portalSessionCookieOptions());
}

export async function clearPortalSessionCookie() {
  const jar = await cookies();
  jar.delete(PORTAL_SESSION_COOKIE);
}

export async function readPortalSessionToken(
  token: string | undefined,
): Promise<PortalSessionPayload | null> {
  if (!token || !authSecretConfigured()) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    const personId = typeof payload.pid === "string" ? payload.pid : null;
    const sessionId = typeof payload.sid === "string" ? payload.sid : null;
    if (!personId || !sessionId) {
      return null;
    }
    return { personId, sessionId };
  } catch {
    return null;
  }
}

export async function getPortalSessionPayload() {
  const jar = await cookies();
  return readPortalSessionToken(jar.get(PORTAL_SESSION_COOKIE)?.value);
}
