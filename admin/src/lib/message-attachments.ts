import {
  insertMessageAttachments,
} from "@/db/queries";
import {
  delIfBlob,
  uploadMessageAttachments,
  type AttachmentUploadOk,
} from "@/lib/blob-storage";

/** True when the form includes at least one non-empty attachment file. */
export function formHasAttachments(formData: FormData): boolean {
  return formData
    .getAll("attachments")
    .some((item) => item instanceof File && item.size > 0);
}

/**
 * Upload private Blobs and insert rows. On failure, deletes uploaded Blobs.
 * Caller should delete the message or leave it empty if this returns an error
 * after the message was already created — we prefer rolling back Blobs only;
 * the action should surface the error and not notify if attachments failed.
 */
export async function persistMessageAttachments(options: {
  formData: FormData;
  clientId: string;
  projectId: string;
  messageId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const uploaded = await uploadMessageAttachments(options);
  if (!uploaded.ok) {
    return uploaded;
  }
  if (uploaded.files.length === 0) {
    return { ok: true };
  }
  try {
    await insertMessageAttachments(
      uploaded.files.map((file: AttachmentUploadOk) => ({
        messageId: options.messageId,
        projectId: options.projectId,
        clientId: options.clientId,
        blobUrl: file.blobUrl,
        blobPathname: file.blobPathname,
        originalFilename: file.originalFilename,
        contentType: file.contentType,
        byteSize: file.byteSize,
      })),
    );
    return { ok: true };
  } catch {
    await Promise.all(uploaded.files.map((file) => delIfBlob(file.blobUrl)));
    return { ok: false, error: "Could not save attachments." };
  }
}
