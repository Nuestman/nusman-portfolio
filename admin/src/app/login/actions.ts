"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_DAYS,
  authSecretConfigured,
  clearSession,
  createSessionCookie,
  getAdminCredentials,
  getSessionPayload,
  passwordsMatch,
} from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { recordAuditSafe } from "@/lib/audit";
import {
  clearLoginFailures,
  loginIsBlocked,
  recordLoginFailure,
} from "@/lib/login-limit";
import { safeInternalPath } from "@/lib/paths";
import {
  createSessionRow,
  createUser,
  deleteSession,
  getUserByEmail,
  setUserPasswordHash,
} from "@/db/queries";

export type LoginState = {
  error: string | null;
};

async function loginKey() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip || requestHeaders.get("x-real-ip") || "local";
}

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!authSecretConfigured()) {
    return {
      error: "Desk login is not configured. Set AUTH_SECRET.",
    };
  }

  const key = await loginKey();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (loginIsBlocked(key)) {
    await recordAuditSafe({
      action: "login.blocked",
      summary: "Login blocked after too many attempts.",
      entityType: "session",
      actorEmail: email || null,
    });
    return { error: "Too many attempts. Wait 15 minutes, then try again." };
  }

  const password = String(formData.get("password") ?? "");
  const expected = getAdminCredentials();
  let user = await getUserByEmail(email).catch(() => null);

  const envMatch =
    Boolean(expected.email) &&
    email === expected.email &&
    passwordsMatch(password, expected.password);

  if (!user && envMatch) {
    const name = process.env.ADMIN_NAME?.trim() || "Numan Usman";
    await createUser({
      email,
      name,
      title: "Owner",
      phone: null,
      passwordHash: hashPassword(password),
      role: "owner",
      imageUrl: "/avatars/numan.png",
    });
    user = await getUserByEmail(email);
  }

  if (!user || !user.active) {
    recordLoginFailure(key);
    await recordAuditSafe({
      action: "login.failure",
      summary: "Sign-in failed.",
      entityType: "session",
      actorEmail: email || null,
    });
    return { error: "Email or password is wrong." };
  }

  const hashOk = user.passwordHash
    ? verifyPassword(password, user.passwordHash)
    : false;
  if (!hashOk && !envMatch) {
    recordLoginFailure(key);
    await recordAuditSafe({
      action: "login.failure",
      summary: "Sign-in failed.",
      entityType: "session",
      actorEmail: email || null,
    });
    return { error: "Email or password is wrong." };
  }

  if (!user.passwordHash && envMatch) {
    await setUserPasswordHash(user.id, hashPassword(password));
  }

  const requestHeaders = await headers();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  const sessionId = await createSessionRow({
    userId: user.id,
    expiresAt,
    userAgent: requestHeaders.get("user-agent"),
    ip: key,
  });
  await createSessionCookie({
    email: user.email,
    userId: user.id,
    sessionId,
  });

  clearLoginFailures(key);
  await recordAuditSafe({
    action: "login.success",
    summary: "Signed in.",
    entityType: "session",
    actorEmail: user.email,
  });
  redirect(safeInternalPath(String(formData.get("from") ?? "")));
}

export async function logout() {
  const payload = await getSessionPayload();
  if (payload?.sessionId) {
    await deleteSession(payload.sessionId).catch(() => undefined);
  }
  await recordAuditSafe({
    action: "logout",
    summary: "Signed out.",
    entityType: "session",
    actorEmail: payload?.email ?? null,
  });
  await clearSession();
  redirect("/login");
}
