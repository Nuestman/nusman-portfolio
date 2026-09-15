"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_DAYS,
  authSecretConfigured,
  clearPendingLogin,
  clearSession,
  createPendingLoginCookie,
  createSessionCookie,
  getAdminCredentials,
  getSessionPayload,
  passwordsMatch,
  readPendingLogin,
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
  getUserById,
  setUserPasswordHash,
  setUserTotp,
} from "@/db/queries";
import {
  parseRecoveryHashes,
  recoveryCodeMatches,
  verifyTotp,
} from "@/lib/totp";

export type LoginState = {
  error: string | null;
};

async function loginKey() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip || requestHeaders.get("x-real-ip") || "local";
}

async function failLogin(key: string, email: string): Promise<LoginState> {
  recordLoginFailure(key);
  await recordAuditSafe({
    action: "login.failure",
    summary: "Sign-in failed.",
    entityType: "session",
    actorEmail: email || null,
  });
  return { error: "Email or password is wrong." };
}

async function completeLogin(
  user: { id: string; email: string },
  key: string,
  from: string,
) {
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
  await clearPendingLogin();
  clearLoginFailures(key);
  await recordAuditSafe({
    action: "login.success",
    summary: "Signed in.",
    entityType: "session",
    actorEmail: user.email,
  });
  redirect(safeInternalPath(from));
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
  const from = String(formData.get("from") ?? "");
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
    return failLogin(key, email);
  }

  const hashOk = user.passwordHash
    ? verifyPassword(password, user.passwordHash)
    : false;
  const envBootstrap = !user.passwordHash && envMatch;
  if (!hashOk && !envBootstrap) {
    return failLogin(key, email);
  }

  if (envBootstrap) {
    await setUserPasswordHash(user.id, hashPassword(password));
  }

  if (user.totpEnabled && user.totpSecret) {
    await createPendingLoginCookie({
      email: user.email,
      userId: user.id,
    });
    await recordAuditSafe({
      action: "login.totp-challenge",
      summary: "Password accepted; authenticator code required.",
      entityType: "session",
      actorEmail: user.email,
    });
    redirect(`/login?from=${encodeURIComponent(safeInternalPath(from))}`);
  }

  await completeLogin(user, key, from);
  return { error: null };
}

export async function verifyTotpLogin(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!authSecretConfigured()) {
    return { error: "Desk login is not configured. Set AUTH_SECRET." };
  }

  const key = await loginKey();
  const from = String(formData.get("from") ?? "");
  if (loginIsBlocked(key)) {
    await recordAuditSafe({
      action: "login.blocked",
      summary: "Login blocked after too many attempts.",
      entityType: "session",
    });
    return { error: "Too many attempts. Wait 15 minutes, then try again." };
  }

  const pending = await readPendingLogin();
  if (!pending) {
    return { error: "That sign-in expired. Enter email and password again." };
  }

  const user = await getUserById(pending.userId).catch(() => null);
  if (!user || !user.active || !user.totpEnabled || !user.totpSecret) {
    await clearPendingLogin();
    return { error: "That sign-in expired. Enter email and password again." };
  }

  const code = String(formData.get("code") ?? "");
  if (verifyTotp(user.totpSecret, code)) {
    await completeLogin(user, key, from);
    return { error: null };
  }

  const hashes = parseRecoveryHashes(user.totpRecoveryHashes);
  const matched = recoveryCodeMatches(code, hashes);
  if (matched) {
    await setUserTotp(user.id, {
      totpSecret: user.totpSecret,
      totpEnabled: true,
      totpRecoveryHashes: hashes.filter((item) => item !== matched),
    });
    await recordAuditSafe({
      action: "login.recovery",
      summary: "Signed in with a recovery code.",
      entityType: "session",
      actorEmail: user.email,
    });
    await completeLogin(user, key, from);
    return { error: null };
  }

  recordLoginFailure(key);
  await recordAuditSafe({
    action: "login.totp-failure",
    summary: "Authenticator code failed.",
    entityType: "session",
    actorEmail: user.email,
  });
  return { error: "That code is wrong." };
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
  await clearPendingLogin();
  await clearSession();
  redirect("/login");
}
