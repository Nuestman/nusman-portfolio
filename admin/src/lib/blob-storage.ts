import { randomUUID } from "crypto";
import { del, get, put } from "@vercel/blob";

export const AVATAR_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
export const AVATAR_MAX_BYTES = 400 * 1024;

export const ATTACHMENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
]);
export const ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
export const ATTACHMENT_MAX_COUNT = 3;

const BLOB_HOST_RE = /\.blob\.vercel-storage\.com$/i;

export function isVercelBlobUrl(url: string | null | undefined): boolean {
  if (!url) {
    return false;
  }
  try {
    return BLOB_HOST_RE.test(new URL(url).hostname);
  } catch {
    return false;
  }
}

export function blobConfigErrorMessage(error: unknown): string | null {
  const message =
    error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  if (
    message.includes("no blob credentials") ||
    message.includes("no read-write token") ||
    message.includes("oidc") ||
    message.includes("blob_store_id") ||
    message.includes("store does not exist")
  ) {
    return "Blob storage is not configured. On Vercel, connect the Blob store to this project. Locally run `vercel env pull` (include Development on the store connection).";
  }
  return null;
}

/** Stem only — no path, extension stripped, safe chars. */
export function sanitizeFilenameStem(raw: string, maxLen = 80): string {
  const base = raw.replace(/^.*[\\/]/, "").replace(/\.[^.]+$/, "");
  const cleaned = base
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
    .slice(0, maxLen);
  return cleaned || "file";
}

function extensionForMime(
  mime: string,
): "png" | "jpg" | "webp" | "pdf" | null {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/jpeg":
      return "jpg";
    case "application/pdf":
      return "pdf";
    default:
      return null;
  }
}

export async function delIfBlob(url: string | null | undefined): Promise<void> {
  if (!isVercelBlobUrl(url) || !url) {
    return;
  }
  try {
    await del(url);
  } catch {
    // Already gone or no permission — caller already has the new object.
  }
}

export type AvatarUploadResult =
  | { ok: true; value: null }
  | { ok: true; value: { imageUrl: string } }
  | { ok: false; error: string };

async function uploadPrivateAvatar(
  pathname: string,
  file: File,
  previousImageUrl: string | null,
): Promise<AvatarUploadResult> {
  if (!AVATAR_TYPES.has(file.type)) {
    return { ok: false, error: "Use a PNG, JPEG, or WebP photo." };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { ok: false, error: "Photo must be under 400 KB." };
  }
  const ext = extensionForMime(file.type);
  if (!ext || ext === "pdf") {
    return { ok: false, error: "Use a PNG, JPEG, or WebP photo." };
  }

  try {
    const blob = await put(`${pathname}.${ext}`, file, {
      access: "private",
      contentType: file.type,
      addRandomSuffix: false,
    });
    await delIfBlob(previousImageUrl);
    return { ok: true, value: { imageUrl: blob.url } };
  } catch (error: unknown) {
    return {
      ok: false,
      error:
        blobConfigErrorMessage(error) ??
        "Could not upload the photo. Try again or use a smaller file.",
    };
  }
}

export async function uploadOperatorAvatar(
  userId: string,
  formData: FormData,
  previousImageUrl: string | null,
): Promise<AvatarUploadResult> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: true, value: null };
  }
  const pathname = `operators/${userId}/avatar-${randomUUID()}`;
  return uploadPrivateAvatar(pathname, file, previousImageUrl);
}

export async function uploadPersonAvatar(
  clientId: string,
  personId: string,
  formData: FormData,
  previousImageUrl: string | null,
): Promise<AvatarUploadResult> {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: true, value: null };
  }
  const pathname = `clients/${clientId}/people/${personId}/avatar-${randomUUID()}`;
  return uploadPrivateAvatar(pathname, file, previousImageUrl);
}

export type AttachmentUploadOk = {
  blobUrl: string;
  blobPathname: string;
  originalFilename: string;
  contentType: string;
  byteSize: number;
};

export type AttachmentBatchResult =
  | { ok: true; files: AttachmentUploadOk[] }
  | { ok: false; error: string };

function readAttachmentFiles(formData: FormData): File[] {
  const raw = formData.getAll("attachments");
  const files: File[] = [];
  for (const item of raw) {
    if (item instanceof File && item.size > 0) {
      files.push(item);
    }
  }
  return files;
}

/**
 * Upload private message attachments under a client/project/message path.
 * Call after the message row exists. On failure, deletes any Blobs already put.
 */
export async function uploadMessageAttachments(options: {
  formData: FormData;
  clientId: string;
  projectId: string;
  messageId: string;
}): Promise<AttachmentBatchResult> {
  const files = readAttachmentFiles(options.formData);
  if (files.length === 0) {
    return { ok: true, files: [] };
  }
  if (files.length > ATTACHMENT_MAX_COUNT) {
    return {
      ok: false,
      error: `At most ${ATTACHMENT_MAX_COUNT} files per message.`,
    };
  }

  const uploaded: AttachmentUploadOk[] = [];

  try {
    for (const file of files) {
      if (!ATTACHMENT_TYPES.has(file.type)) {
        throw new Error("TYPE");
      }
      if (file.size > ATTACHMENT_MAX_BYTES) {
        throw new Error("SIZE");
      }
      const ext = extensionForMime(file.type);
      if (!ext) {
        throw new Error("TYPE");
      }
      const stem = sanitizeFilenameStem(file.name);
      const displayName = `${stem}.${ext}`;
      const pathname = `clients/${options.clientId}/projects/${options.projectId}/messages/${options.messageId}/${randomUUID()}-${stem}.${ext}`;

      const blob = await put(pathname, file, {
        access: "private",
        contentType: file.type,
        addRandomSuffix: false,
      });

      uploaded.push({
        blobUrl: blob.url,
        blobPathname: pathname,
        originalFilename: displayName,
        contentType: file.type,
        byteSize: file.size,
      });
    }
    return { ok: true, files: uploaded };
  } catch (error: unknown) {
    await Promise.all(uploaded.map((item) => delIfBlob(item.blobUrl)));
    if (error instanceof Error && error.message === "TYPE") {
      return {
        ok: false,
        error: "Attachments must be PNG, JPEG, WebP, or PDF.",
      };
    }
    if (error instanceof Error && error.message === "SIZE") {
      return { ok: false, error: "Each attachment must be under 5 MB." };
    }
    return {
      ok: false,
      error:
        blobConfigErrorMessage(error) ??
        "Could not upload attachments. Try again.",
    };
  }
}

export async function fetchPrivateBlob(
  urlOrPathname: string,
): Promise<{ stream: ReadableStream; contentType: string } | null> {
  try {
    const result = await get(urlOrPathname, { access: "private" });
    if (!result?.stream) {
      return null;
    }
    const contentType =
      result.blob.contentType ||
      result.headers.get("content-type") ||
      "application/octet-stream";
    return { stream: result.stream, contentType };
  } catch {
    return null;
  }
}
