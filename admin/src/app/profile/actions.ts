"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createUser,
  deleteOtherSessions,
  deleteSession,
  deleteSessionsForUser,
  getSessionRow,
  getUserByEmail,
  getUserById,
  publicUserSnapshot,
  setUserActive,
  setUserTotp,
  updateUser,
} from "@/db/queries";
import { deleteWasConfirmed, recordAudit } from "@/lib/audit";
import { getSessionPayload } from "@/lib/auth";
import { uploadOperatorAvatar } from "@/lib/blob-storage";
import { requireSessionUser } from "@/lib/current-user";
import { readOptional, readTrimmed, looksLikeEmail } from "@/lib/forms";
import { isUuid } from "@/lib/ids";
import { hashPassword, passwordTooShort, verifyPassword } from "@/lib/password";
import {
  generateRecoveryCodes,
  generateTotpSecret,
  hashRecoveryCode,
  otpauthUrl,
  parseRecoveryHashes,
  recoveryCodeMatches,
  verifyTotp,
} from "@/lib/totp";
import QRCode from "qrcode";

export type FormState = {
  error: string | null;
};

export type TotpState = {
  error: string | null;
  secret: string | null;
  qrDataUrl: string | null;
  recoveryCodes: string[] | null;
};

export async function updateProfileAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireSessionUser();
  const name = readTrimmed(formData, "name");
  if (!name) {
    return { error: "Name is required." };
  }

  const email = readTrimmed(formData, "email").toLowerCase();
  if (!looksLikeEmail(email)) {
    return { error: "Email does not look right." };
  }

  if (email !== user.email) {
    const taken = await getUserByEmail(email);
    if (taken && taken.id !== user.id) {
      return { error: "That email is already on Desk." };
    }
  }

  const photo = await uploadOperatorAvatar(user.id, formData, user.imageUrl);
  if (!photo.ok) {
    return { error: photo.error };
  }

  const nextValues = {
    name,
    email,
    title: readOptional(formData, "title"),
    phone: readOptional(formData, "phone"),
    ...(photo.value
      ? {
          imageUrl: photo.value.imageUrl,
          imageData: null,
          imageMime: null,
        }
      : {}),
  };

  await updateUser(user.id, nextValues);
  await recordAudit({
    action: "profile.update",
    summary: `Updated profile for ${name}.`,
    entityType: "user",
    entityId: user.id,
    before: publicUserSnapshot(user),
    after: {
      name,
      email,
      title: nextValues.title,
      phone: nextValues.phone,
      photo: photo.value ? "replaced" : "unchanged",
    },
  });
  revalidatePath("/profile");
  revalidatePath("/");
  redirect("/profile");
}

export async function changePasswordAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireSessionUser();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");

  if (!user.passwordHash) {
    return { error: "Set a password by signing in once, then change it here." };
  }
  if (!verifyPassword(current, user.passwordHash)) {
    return { error: "Current password is wrong." };
  }
  if (passwordTooShort(next)) {
    return { error: "New password must be at least 8 characters." };
  }
  if (next !== confirm) {
    return { error: "New password and confirmation do not match." };
  }

  await updateUser(user.id, {
    email: user.email,
    name: user.name,
    title: user.title,
    phone: user.phone,
    passwordHash: hashPassword(next),
  });

  const payload = await getSessionPayload();
  if (payload?.sessionId) {
    await deleteOtherSessions(user.id, payload.sessionId);
  } else {
    await deleteSessionsForUser(user.id);
  }

  await recordAudit({
    action: "profile.password",
    summary: `Changed password for ${user.name}.`,
    entityType: "user",
    entityId: user.id,
  });
  revalidatePath("/profile");
  redirect("/profile?notice=password");
}

export async function createOperatorAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const actor = await requireSessionUser();
  if (actor.role !== "owner") {
    return { error: "Only the owner can add operators." };
  }

  const name = readTrimmed(formData, "name");
  if (!name) {
    return { error: "Name is required." };
  }
  const email = readTrimmed(formData, "email").toLowerCase();
  if (!looksLikeEmail(email)) {
    return { error: "Email does not look right." };
  }
  const existing = await getUserByEmail(email);
  if (existing) {
    return { error: "That email is already on Desk." };
  }

  const password = String(formData.get("password") ?? "");
  if (passwordTooShort(password)) {
    return { error: "Password must be at least 8 characters." };
  }

  const created = await createUser({
    email,
    name,
    title: readOptional(formData, "title"),
    phone: readOptional(formData, "phone"),
    passwordHash: hashPassword(password),
    role: "operator",
  });

  await recordAudit({
    action: "user.create",
    summary: `Added operator ${name}.`,
    entityType: "user",
    entityId: created.id,
    after: publicUserSnapshot(created),
  });
  revalidatePath("/profile");
  redirect("/profile?notice=added");
}

export async function deactivateUserAction(formData: FormData) {
  const actor = await requireSessionUser();
  if (actor.role !== "owner") {
    redirect("/profile");
  }

  const id = readTrimmed(formData, "id");
  if (!isUuid(id) || id === actor.id) {
    redirect("/profile");
  }

  const target = await getUserById(id);
  if (!target || target.role === "owner") {
    redirect("/profile");
  }
  if (!deleteWasConfirmed(formData)) {
    redirect("/profile");
  }

  await setUserActive(id, false);
  await deleteSessionsForUser(id);
  await recordAudit({
    action: "user.deactivate",
    summary: `Deactivated ${target.name}.`,
    entityType: "user",
    entityId: id,
    before: publicUserSnapshot(target),
    after: { ...publicUserSnapshot(target), active: false },
  });
  revalidatePath("/profile");
  redirect("/profile");
}

export async function activateUserAction(formData: FormData) {
  const actor = await requireSessionUser();
  if (actor.role !== "owner") {
    redirect("/profile");
  }

  const id = readTrimmed(formData, "id");
  if (!isUuid(id)) {
    redirect("/profile");
  }

  const target = await getUserById(id);
  if (!target) {
    redirect("/profile");
  }

  await setUserActive(id, true);
  await recordAudit({
    action: "user.activate",
    summary: `Reactivated ${target.name}.`,
    entityType: "user",
    entityId: id,
    before: publicUserSnapshot(target),
    after: { ...publicUserSnapshot(target), active: true },
  });
  revalidatePath("/profile");
  redirect("/profile");
}

export async function revokeOtherSessionsAction() {
  const user = await requireSessionUser();
  const payload = await getSessionPayload();
  if (!payload?.sessionId) {
    redirect("/profile?notice=relogin");
  }
  await deleteOtherSessions(user.id, payload.sessionId);
  await recordAudit({
    action: "session.revoke-others",
    summary: "Signed out other devices.",
    entityType: "session",
    entityId: user.id,
  });
  revalidatePath("/profile");
  redirect("/profile?notice=devices");
}

export async function revokeSessionAction(formData: FormData) {
  const user = await requireSessionUser();
  const payload = await getSessionPayload();
  const id = readTrimmed(formData, "id");
  if (!isUuid(id) || id === payload?.sessionId) {
    redirect("/profile");
  }

  const row = await getSessionRow(id);
  if (!row || row.userId !== user.id) {
    redirect("/profile");
  }

  await deleteSession(id);
  await recordAudit({
    action: "session.revoke",
    summary: "Signed out a device.",
    entityType: "session",
    entityId: user.id,
  });
  revalidatePath("/profile");
  redirect("/profile?notice=devices");
}

export async function startTotpAction(
  _previous: TotpState,
  _formData: FormData,
): Promise<TotpState> {
  const user = await requireSessionUser();
  if (user.totpEnabled) {
    return {
      error: "Authenticator is already on.",
      secret: null,
      qrDataUrl: null,
      recoveryCodes: null,
    };
  }

  const secret = generateTotpSecret();
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl(user.email, secret), {
    margin: 1,
    width: 220,
    color: { dark: "#150F00", light: "#ffffff" },
  });

  return {
    error: null,
    secret,
    qrDataUrl,
    recoveryCodes: null,
  };
}

export async function confirmTotpAction(
  _previous: TotpState,
  formData: FormData,
): Promise<TotpState> {
  const user = await requireSessionUser();
  const secret = readTrimmed(formData, "secret");
  const code = String(formData.get("code") ?? "");
  if (!secret || !verifyTotp(secret, code)) {
    return {
      error: "That code is wrong. Scan again or wait for a new code.",
      secret,
      qrDataUrl: readTrimmed(formData, "qrDataUrl") || null,
      recoveryCodes: null,
    };
  }

  const recoveryCodes = generateRecoveryCodes();
  await setUserTotp(user.id, {
    totpSecret: secret,
    totpEnabled: true,
    totpRecoveryHashes: recoveryCodes.map(hashRecoveryCode),
  });
  await recordAudit({
    action: "profile.totp-enable",
    summary: `Turned on authenticator for ${user.name}.`,
    entityType: "user",
    entityId: user.id,
  });
  revalidatePath("/profile");
  return {
    error: null,
    secret: null,
    qrDataUrl: null,
    recoveryCodes,
  };
}

export async function disableTotpAction(
  _previous: TotpState,
  formData: FormData,
): Promise<TotpState> {
  const user = await requireSessionUser();
  const empty = {
    error: null as string | null,
    secret: null,
    qrDataUrl: null,
    recoveryCodes: null,
  };
  if (!user.totpEnabled || !user.totpSecret) {
    return { ...empty, error: "Authenticator is not on." };
  }

  const code = String(formData.get("code") ?? "");
  const totpOk = verifyTotp(user.totpSecret, code);
  const hashes = parseRecoveryHashes(user.totpRecoveryHashes);
  const matched = totpOk ? null : recoveryCodeMatches(code, hashes);
  if (!totpOk && !matched) {
    return { ...empty, error: "That code is wrong." };
  }

  await setUserTotp(user.id, {
    totpSecret: null,
    totpEnabled: false,
    totpRecoveryHashes: null,
  });
  await recordAudit({
    action: "profile.totp-disable",
    summary: `Turned off authenticator for ${user.name}.`,
    entityType: "user",
    entityId: user.id,
  });
  revalidatePath("/profile");
  redirect("/profile?notice=totp-off");
}

