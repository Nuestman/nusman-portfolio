import { getSessionPayload } from "@/lib/auth";
import { getSessionRow, getUserByEmail, getUserById } from "@/db/queries";

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
  if (!payload) {
    return null;
  }

  if (payload.sessionId) {
    const row = await getSessionRow(payload.sessionId);
    if (!row || row.expiresAt.getTime() < Date.now()) {
      return null;
    }
  }

  const user = payload.userId
    ? await getUserById(payload.userId)
    : await getUserByEmail(payload.email);
  if (!user || !user.active) {
    return null;
  }

  return user;
}
