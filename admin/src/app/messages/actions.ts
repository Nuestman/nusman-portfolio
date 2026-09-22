"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addPortalMessage, getClient, getProject } from "@/db/queries";
import { recordAudit } from "@/lib/audit";
import { requireSessionUser } from "@/lib/current-user";
import { readTrimmed } from "@/lib/forms";
import { isUuid } from "@/lib/ids";
import { readMessageBodyFromForm } from "@/lib/message-body";
import {
  formHasAttachments,
  persistMessageAttachments,
} from "@/lib/message-attachments";
import { notifyClientsOfPortalMessage } from "@/lib/notify";

export type FormState = {
  error: string | null;
};

export async function openPortalConversationAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();

  const projectId = readTrimmed(formData, "projectId");
  const clientId = readTrimmed(formData, "clientId");
  if (!isUuid(projectId) || !isUuid(clientId)) {
    return { error: "Pick a client and project." };
  }

  const [project, client] = await Promise.all([
    getProject(projectId),
    getClient(clientId),
  ]);
  if (
    !project ||
    !client ||
    project.clientId !== clientId ||
    project.workKind !== "client" ||
    client.kind === "practice"
  ) {
    return { error: "That project is not available for messaging." };
  }

  const { body } = readMessageBodyFromForm(formData);
  const hasFiles = formHasAttachments(formData);
  if (body || hasFiles) {
    const messageId = await addPortalMessage({
      projectId,
      personId: null,
      authorKind: "operator",
      body: body || "(attachment)",
    });
    const attached = await persistMessageAttachments({
      formData,
      clientId,
      projectId,
      messageId,
    });
    if (!attached.ok) {
      return { error: attached.error };
    }
    await recordAudit({
      action: "portal.message",
      summary: `Started portal conversation on “${project.title}”.`,
      entityType: "portal_message",
      projectId,
      after: {
        body,
        authorKind: "operator",
        messageId,
        hasAttachments: hasFiles,
      },
    });
    await notifyClientsOfPortalMessage({
      clientId,
      projectId,
      projectTitle: project.title,
      body: body || "(attachment)",
    });
    revalidatePath("/messages");
    revalidatePath(`/messages/${projectId}`);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/portal/projects/${projectId}/messages`);
  }

  redirect(`/messages/${projectId}`);
}
