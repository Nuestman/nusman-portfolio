"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addPortalMessage,
  ensureIntakeAnswers,
  getPortalProjectForPerson,
  saveIntakeAnswers,
} from "@/db/queries";
import { requirePortalPerson } from "@/lib/current-person";
import { recordAuditSafe } from "@/lib/audit";
import { readTrimmed } from "@/lib/forms";
import { isUuid } from "@/lib/ids";
import { INTAKE_QUESTIONS } from "@/lib/templates";

export type PortalFormState = {
  error: string | null;
};

export async function savePortalIntakeAction(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  const { person, client } = await requirePortalPerson();
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(projectId)) {
    return { error: "Project is missing." };
  }

  const project = await getPortalProjectForPerson(projectId, client.id);
  if (!project) {
    return { error: "That project is gone." };
  }
  if (!project.portalIntakeOpen) {
    return { error: "Intake is closed. Ask Usman if you need to change answers." };
  }

  await ensureIntakeAnswers(projectId);
  const next = INTAKE_QUESTIONS.map((item) => ({
    theme: item.theme,
    ask: item.ask,
    answer: readTrimmed(formData, `answer_${item.theme}`) || null,
  }));
  await saveIntakeAnswers(projectId, next);
  await recordAuditSafe({
    action: "portal.intake-save",
    summary: `${person.name} saved portal intake on “${project.title}”.`,
    entityType: "intake",
    projectId,
    actorEmail: person.email,
  });
  revalidatePath(`/portal/projects/${projectId}/intake`);
  revalidatePath(`/projects/${projectId}`);
  redirect(`/projects/${projectId}/intake?notice=saved`);
}

export async function postPortalMessageAction(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  const { person, client } = await requirePortalPerson();
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(projectId)) {
    return { error: "Project is missing." };
  }

  const project = await getPortalProjectForPerson(projectId, client.id);
  if (!project) {
    return { error: "That project is gone." };
  }

  const body = readTrimmed(formData, "body");
  if (!body) {
    return { error: "Write a message first." };
  }

  await addPortalMessage({
    projectId,
    personId: person.id,
    authorKind: "client",
    body,
  });
  await recordAuditSafe({
    action: "portal.message",
    summary: `${person.name} sent a portal message on “${project.title}”.`,
    entityType: "portal_message",
    projectId,
    actorEmail: person.email,
    after: { body },
  });
  revalidatePath(`/portal/projects/${projectId}/messages`);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/messages`);
  revalidatePath(`/messages/${projectId}`);
  redirect(`/projects/${projectId}/messages`);
}
