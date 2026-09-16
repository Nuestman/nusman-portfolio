"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addNote,
  addPortalMessage,
  createProjectEvent,
  ensureIntakeAnswers,
  getPerson,
  getPortalProjectForPerson,
  getProjectEvent,
  saveIntakeAnswers,
  setProjectEventStatus,
} from "@/db/queries";
import { requirePortalPerson } from "@/lib/current-person";
import { recordAuditSafe } from "@/lib/audit";
import { readOptional, readTrimmed } from "@/lib/forms";
import { isUuid } from "@/lib/ids";
import {
  isProjectEventKind,
  projectEventKindLabel,
} from "@/lib/labels";
import { parseDatetimeLocal } from "@/lib/text";
import { INTAKE_QUESTIONS } from "@/lib/templates";

export type PortalFormState = {
  error: string | null;
};

function revalidatePortalProject(projectId: string) {
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}/intake`);
  revalidatePath(`/portal/projects/${projectId}/messages`);
  revalidatePath(`/portal/projects/${projectId}/schedule`);
  revalidatePath(`/portal/schedule`);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/intake`);
  revalidatePath(`/projects/${projectId}/messages`);
  revalidatePath(`/projects/${projectId}/schedule`);
  revalidatePath(`/schedule`);
  revalidatePath(`/messages`);
  revalidatePath(`/messages/${projectId}`);
}

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
  revalidatePortalProject(projectId);
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
  revalidatePortalProject(projectId);
  redirect(`/projects/${projectId}/messages`);
}

export async function confirmPortalEventAction(formData: FormData) {
  const { person, client } = await requirePortalPerson();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    redirect("/projects");
  }

  const project = await getPortalProjectForPerson(projectId, client.id);
  const event = await getProjectEvent(id);
  if (!project || !event || event.projectId !== projectId) {
    redirect("/projects");
  }

  if (event.status !== "proposed") {
    redirect("/schedule");
  }

  await setProjectEventStatus(id, "confirmed");
  await addNote(
    projectId,
    `${person.name} confirmed “${event.title}”.`,
    true,
  );
  await recordAuditSafe({
    action: "portal.event-confirm",
    summary: `${person.name} confirmed “${event.title}” on “${project.title}”.`,
    entityType: "event",
    entityId: id,
    projectId,
    actorEmail: person.email,
    before: { status: event.status },
    after: { status: "confirmed" },
  });
  revalidatePortalProject(projectId);
  redirect("/schedule");
}

export async function declinePortalEventAction(formData: FormData) {
  const { person, client } = await requirePortalPerson();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    redirect("/projects");
  }

  const project = await getPortalProjectForPerson(projectId, client.id);
  const event = await getProjectEvent(id);
  if (!project || !event || event.projectId !== projectId) {
    redirect("/projects");
  }

  if (event.status !== "proposed") {
    redirect("/schedule");
  }

  await setProjectEventStatus(id, "cancelled");
  await addNote(
    projectId,
    `${person.name} declined “${event.title}”.`,
    true,
  );
  await recordAuditSafe({
    action: "portal.event-decline",
    summary: `${person.name} declined “${event.title}” on “${project.title}”.`,
    entityType: "event",
    entityId: id,
    projectId,
    actorEmail: person.email,
    before: { status: event.status },
    after: { status: "cancelled" },
  });
  revalidatePortalProject(projectId);
  redirect("/schedule");
}

export async function cancelPortalEventAction(formData: FormData) {
  const { person, client } = await requirePortalPerson();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    redirect("/projects");
  }

  const project = await getPortalProjectForPerson(projectId, client.id);
  const event = await getProjectEvent(id);
  if (!project || !event || event.projectId !== projectId) {
    redirect("/projects");
  }

  if (
    event.status !== "requested" &&
    event.status !== "proposed" &&
    event.status !== "confirmed"
  ) {
    redirect("/schedule");
  }

  await setProjectEventStatus(id, "cancelled");
  await addNote(
    projectId,
    `${person.name} cancelled “${event.title}”.`,
    true,
  );
  await recordAuditSafe({
    action: "portal.event-cancel",
    summary: `${person.name} cancelled “${event.title}” on “${project.title}”.`,
    entityType: "event",
    entityId: id,
    projectId,
    actorEmail: person.email,
    before: { status: event.status },
    after: { status: "cancelled" },
  });
  revalidatePortalProject(projectId);
  redirect("/schedule");
}

export async function requestPortalEventAction(
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

  const kindRaw = readTrimmed(formData, "kind");
  if (!isProjectEventKind(kindRaw)) {
    return { error: "Choose a kind." };
  }

  const title = readTrimmed(formData, "title");
  if (!title) {
    return { error: "Say what the meeting is for." };
  }

  const startsAt = parseDatetimeLocal(readOptional(formData, "startsAt"));
  const notes = readOptional(formData, "notes");

  const personIdRaw = readTrimmed(formData, "personId");
  let forPerson = person;
  if (personIdRaw && personIdRaw !== person.id) {
    if (!isUuid(personIdRaw)) {
      return { error: "Pick who this meeting is for." };
    }
    const selected = await getPerson(personIdRaw);
    if (!selected || selected.clientId !== client.id) {
      return { error: "That person is not on your account." };
    }
    forPerson = selected;
  }

  const id = await createProjectEvent(projectId, {
    kind: kindRaw,
    title,
    status: "requested",
    startsAt,
    endsAt: null,
    location: null,
    notes,
    createdByKind: "client",
    personId: forPerson.id,
  });

  await addNote(
    projectId,
    `${person.name} requested ${projectEventKindLabel(kindRaw).toLowerCase()}: ${title}${forPerson.id !== person.id ? ` (for ${forPerson.name})` : ""}.`,
    true,
  );
  await recordAuditSafe({
    action: "portal.event-request",
    summary: `${person.name} requested “${title}” on “${project.title}”.`,
    entityType: "event",
    entityId: id,
    projectId,
    actorEmail: person.email,
    after: {
      kind: kindRaw,
      title,
      status: "requested" as const,
      startsAt,
      notes,
      personId: forPerson.id,
    },
  });
  revalidatePortalProject(projectId);
  redirect("/schedule");
}
