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
  updateUser,
} from "@/db/queries";
import { deleteWasConfirmed, recordAudit } from "@/lib/audit";
import { getSessionPayload } from "@/lib/auth";
import { getSessionUser } from "@/lib/current-user";
import { readOptional, readTrimmed, looksLikeEmail } from "@/lib/forms";
import { isUuid } from "@/lib/ids";
import { hashPassword, passwordTooShort, verifyPassword } from "@/lib/password";

export type FormState = {
  error: string | null;
};

const PHOTO_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const PHOTO_MAX_BYTES = 400 * 1024;

async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

async function readPhoto(formData: FormData) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: true as const, value: null };
  }
  if (!PHOTO_TYPES.has(file.type)) {
    return { ok: false as const, error: "Use a PNG, JPEG, or WebP photo." };
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return { ok: false as const, error: "Photo must be under 400 KB." };
  }
  const data = Buffer.from(await file.arrayBuffer()).toString("base64");
  return { ok: true as const, value: { imageData: data, imageMime: file.type } };
}

export async function updateProfileAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireUser();
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

  const photo = await readPhoto(formData);
  if (!photo.ok) {
    return { error: photo.error };
  }

  const nextValues = {
    name,
    email,
    title: readOptional(formData, "title"),
    phone: readOptional(formData, "phone"),
    ...(photo.value
      ? { ...photo.value, imageUrl: `/profile/photo/${user.id}` }
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
  const user = await requireUser();
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
  const actor = await requireUser();
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
  const actor = await requireUser();
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
  const actor = await requireUser();
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
  const user = await requireUser();
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
  const user = await requireUser();
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
