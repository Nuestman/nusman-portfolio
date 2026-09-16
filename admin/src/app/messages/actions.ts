"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addPortalMessage, getClient, getProject } from "@/db/queries";
import { recordAudit } from "@/lib/audit";
import { requireSessionUser } from "@/lib/current-user";
import { readTrimmed } from "@/lib/forms";
import { isUuid } from "@/lib/ids";
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

  const body = readTrimmed(formData, "body");
  if (body) {
    await addPortalMessage({
      projectId,
      personId: null,
      authorKind: "operator",
      body,
    });
    await recordAudit({
      action: "portal.message",
      summary: `Started portal conversation on “${project.title}”.`,
      entityType: "portal_message",
      projectId,
      after: { body, authorKind: "operator" },
    });
    await notifyClientsOfPortalMessage({
      clientId,
      projectId,
      projectTitle: project.title,
      body,
    });
    revalidatePath("/messages");
    revalidatePath(`/messages/${projectId}`);
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/portal/projects/${projectId}/messages`);
  }

  redirect(`/messages/${projectId}`);
}
