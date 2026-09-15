import { redirect } from "next/navigation";
import { clearSession, getSessionPayload } from "@/lib/auth";
import { getSessionRow, getUserById } from "@/db/queries";

export function userAvatarSrc(user: {
  id: string;
  imageUrl: string | null;
  imageData?: string | null;
}) {
  if (user.imageData) {
    return `/profile/photo/${user.id}`;
  }
  if (user.imageUrl) {
    return user.imageUrl;
  }
  return null;
}

export async function getSessionUser() {
  const payload = await getSessionPayload();
  if (!payload?.sessionId) {
    return null;
  }

  const row = await getSessionRow(payload.sessionId);
  if (!row || row.expiresAt.getTime() < Date.now()) {
    return null;
  }

  const user = await getUserById(row.userId);
  if (!user || !user.active) {
    return null;
  }
  if (payload.userId && payload.userId !== user.id) {
    return null;
  }
  if (payload.email && payload.email !== user.email) {
    return null;
  }

  return user;
}

export async function requireSessionUser() {
  const user = await getSessionUser();
  if (user) {
    return user;
  }
  await clearSession();
  redirect("/login");
}

export async function sessionEmail() {
  const user = await getSessionUser();
  return user?.email ?? null;
}
