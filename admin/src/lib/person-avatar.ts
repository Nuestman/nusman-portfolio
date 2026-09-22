import { DEFAULT_AVATAR_SRC } from "@/lib/avatars";
import { isVercelBlobUrl } from "@/lib/blob-storage";

export function personAvatarSrc(person: {
  id: string;
  imageUrl?: string | null;
}) {
  const url = person.imageUrl?.trim();
  if (!url) {
    return DEFAULT_AVATAR_SRC;
  }
  if (isVercelBlobUrl(url)) {
    return `/api/files/person-avatar/${person.id}`;
  }
  return url;
}

export function personAvatarSrcOrNull(person: {
  id: string;
  imageUrl?: string | null;
}): string | null {
  const url = person.imageUrl?.trim();
  if (!url) {
    return null;
  }
  if (isVercelBlobUrl(url)) {
    return `/api/files/person-avatar/${person.id}`;
  }
  return url;
}
