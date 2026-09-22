import { redirect } from "next/navigation";
import { getSessionRow, getUserById } from "@/db/queries";
import { DEFAULT_AVATAR_SRC } from "@/lib/avatars";
import { clearSession, getSessionPayload } from "@/lib/auth";
import { isVercelBlobUrl } from "@/lib/blob-storage";

export function userAvatarSrc(user: {
  id: string;
  imageUrl: string | null;
  imageData?: string | null;
}) {
  if (isVercelBlobUrl(user.imageUrl) || user.imageData) {
    return `/profile/photo/${user.id}`;
  }
  if (user.imageUrl?.trim()) {
    return user.imageUrl.trim();
  }
  return DEFAULT_AVATAR_SRC;
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
