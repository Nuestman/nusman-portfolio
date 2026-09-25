"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addNote,
  addPortalMessage,
  createDeskNotificationsForActiveUsers,
  createProject,
  createProjectEvent,
  getPerson,
  getPortalProjectForPerson,
  getProjectEvent,
  patchProject,
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
import { readMessageBodyFromForm } from "@/lib/message-body";
import {
  formHasAttachments,
  persistMessageAttachments,
} from "@/lib/message-attachments";
import {
  notifyDeskOfPortalMessage,
  notifyDeskOfSchedule,
} from "@/lib/notify";
import {
  deskNotifyRecipients,
  deskPublicBaseUrl,
  sendPortalProjectStartedNotifyEmail,
} from "@/lib/notify-email";
import { safeInternalPath } from "@/lib/paths";
import { parseDatetimeLocal, formatEventWhen } from "@/lib/text";

export type PortalFormState = {
  error: string | null;
};

function portalEventReturnPath(formData: FormData): string {
  const next = readOptional(formData, "next");
  if (!next) {
    return "/schedule";
  }
  return safeInternalPath(next);
}

function revalidatePortalProject(projectId: string) {
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}/brief`);
  revalidatePath(`/portal/projects/${projectId}/messages`);
  revalidatePath(`/portal/projects/${projectId}/schedule`);
  revalidatePath(`/portal/schedule`);
  revalidatePath(`/portal/projects`);
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/brief`);
  revalidatePath(`/projects/${projectId}/messages`);
  revalidatePath(`/projects/${projectId}/schedule`);
  revalidatePath(`/schedule`);
  revalidatePath(`/messages`);
  revalidatePath(`/messages/${projectId}`);
  revalidatePath(`/projects`);
}

function oneLine(value: string, max = 160): string {
  return value.replace(/[\r\n\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

function portalProjectTitle(organisation: string | null): string {
  if (organisation) {
    return oneLine(`${organisation} — new request`, 120);
  }
  return "Project Title";
}

export async function startPortalProjectAction(
  _previous: PortalFormState,
  formData: FormData,
): Promise<PortalFormState> {
  const { person, client } = await requirePortalPerson();

  const problem = readTrimmed(formData, "problem");
  const wantBuilt = readTrimmed(formData, "wantBuilt");
  const whoFor = readTrimmed(formData, "whoFor");
  const successLooksLike = readTrimmed(formData, "successLooksLike");
  const timeline = readOptional(formData, "timeline");
  const budget = readOptional(formData, "budget");

  if (problem.length < 10) {
    return {
      error: "Tell us what the problem is (at least a short sentence).",
    };
  }
  if (wantBuilt.length < 10) {
    return {
      error: "Tell us what you want built or fixed (at least a short sentence).",
    };
  }
  if (whoFor.length < 5) {
    return { error: "Tell us who this is for." };
  }
  if (successLooksLike.length < 10) {
    return { error: "Tell us what success looks like." };
  }
  if (
    problem.length > 2000 ||
    wantBuilt.length > 2000 ||
    whoFor.length > 500 ||
    successLooksLike.length > 2000
  ) {
    return { error: "One of the answers is too long." };
  }

  const title = portalProjectTitle(client.organisation);

  const projectId = await createProject({
    clientId: client.id,
    title,
    problemSentence: problem.slice(0, 2000),
    wantBuilt: wantBuilt.slice(0, 2000),
    successLooksLike: successLooksLike.slice(0, 2000),
    whoFor: whoFor.slice(0, 500),
    budgetNote: budget,
    deadlineNote: timeline,
    qualifyNotes: [
      "Requested from client portal by logged-in person.",
      `Contact: ${person.name}${person.email ? ` <${person.email}>` : ""}`,
      `Want built: ${wantBuilt.slice(0, 2000)}`,
    ].join("\n"),
  });

  await addNote(
    projectId,
    [
      "Opened from client portal (Start a project).",
      "",
      `Requested by: ${person.name}${person.email ? ` <${person.email}>` : ""}`,
      client.organisation ? `Organisation: ${client.organisation}` : null,
      timeline ? `Timeline: ${timeline}` : null,
      budget ? `Budget: ${budget}` : null,
      "",
      `Problem: ${problem}`,
      `Want built: ${wantBuilt}`,
      `Who for: ${whoFor}`,
      `Success: ${successLooksLike}`,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  );

  await recordAuditSafe({
    action: "portal.project-start",
    summary: `${person.name} started project “${title}” from the portal.`,
    entityType: "project",
    entityId: projectId,
    projectId,
    actorEmail: person.email,
    after: {
      clientId: client.id,
      projectId,
      source: "portal/projects/new",
    },
  });

  await createDeskNotificationsForActiveUsers({
    kind: "project_started",
    title: `Portal project: ${title}`,
    body: `${person.name} (${client.name}): ${problem.slice(0, 280)}`,
    href: `/projects/${projectId}`,
    clientId: client.id,
    projectId,
  }).catch((error) => {
    console.error("Portal project start in-app notify failed", error);
  });

  await sendPortalProjectStartedNotifyEmail({
    to: deskNotifyRecipients(),
    personName: person.name,
    clientName: client.name,
    projectTitle: title,
    problem,
    wantBuilt,
    projectUrl: `${deskPublicBaseUrl()}/projects/${projectId}`,
  }).catch((error) => {
    console.error("Portal project start notify failed", error);
  });

  revalidatePortalProject(projectId);
  redirect(`/projects/${projectId}/schedule?notice=started`);
}

export async function savePortalBriefAction(
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
    return {
      error: "The brief is locked. Ask Usman if you need to change it.",
    };
  }

  const problem = readOptional(formData, "problem");
  const wantBuilt = readOptional(formData, "wantBuilt");
  const successLooksLike = readOptional(formData, "successLooksLike");
  const deadline = readOptional(formData, "deadline");
  const whoFor = readOptional(formData, "whoFor");
  const budgetNote = readOptional(formData, "budgetNote");
  const notes = readOptional(formData, "notes");

  if (
    (problem && problem.length > 2000) ||
    (wantBuilt && wantBuilt.length > 2000) ||
    (successLooksLike && successLooksLike.length > 2000) ||
    (whoFor && whoFor.length > 500) ||
    (deadline && deadline.length > 200) ||
    (budgetNote && budgetNote.length > 200) ||
    (notes && notes.length > 4000)
  ) {
    return { error: "One of the answers is too long." };
  }

  const nextValues = {
    problemSentence: problem,
    wantBuilt,
    successLooksLike,
    deadlineNote: deadline,
    whoFor,
    budgetNote,
    qualifyNotes: notes,
  };
  await patchProject(projectId, nextValues);
  await recordAuditSafe({
    action: "portal.brief-save",
    summary: `${person.name} updated the project brief on “${project.title}”.`,
    entityType: "project",
    entityId: projectId,
    projectId,
    actorEmail: person.email,
    before: {
      problemSentence: project.problemSentence,
      wantBuilt: project.wantBuilt,
      successLooksLike: project.successLooksLike,
      deadlineNote: project.deadlineNote,
      whoFor: project.whoFor,
      budgetNote: project.budgetNote,
      qualifyNotes: project.qualifyNotes,
    },
    after: nextValues,
  });
  revalidatePortalProject(projectId);
  redirect(`/projects/${projectId}/brief?notice=saved`);
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

  const { body } = readMessageBodyFromForm(formData);
  const hasFiles = formHasAttachments(formData);
  if (!body && !hasFiles) {
    return { error: "Write a message or attach a file." };
  }

  const messageId = await addPortalMessage({
    projectId,
    personId: person.id,
    authorKind: "client",
    body: body || "(attachment)",
  });
  const attached = await persistMessageAttachments({
    formData,
    clientId: client.id,
    projectId,
    messageId,
  });
  if (!attached.ok) {
    return { error: attached.error };
  }
  await recordAuditSafe({
    action: "portal.message",
    summary: `${person.name} sent a portal message on “${project.title}”.`,
    entityType: "portal_message",
    projectId,
    actorEmail: person.email,
    after: { body, messageId, hasAttachments: hasFiles },
  });
  await notifyDeskOfPortalMessage({
    projectId,
    projectTitle: project.title,
    authorName: person.name,
    body: body || "(attachment)",
  });
  revalidatePortalProject(projectId);
  redirect(`/messages/${projectId}`);
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
    redirect(portalEventReturnPath(formData));
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
  await notifyDeskOfSchedule({
    projectId,
    projectTitle: project.title,
    headline: `${person.name} confirmed “${event.title}”.`,
    details: [
      "Status: confirmed",
      `When: ${formatEventWhen(event.startsAt)}`,
    ],
  });
  revalidatePortalProject(projectId);
  redirect(portalEventReturnPath(formData));
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
    redirect(portalEventReturnPath(formData));
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
  await notifyDeskOfSchedule({
    projectId,
    projectTitle: project.title,
    headline: `${person.name} declined “${event.title}”.`,
    details: ["Status: cancelled", `When: ${formatEventWhen(event.startsAt)}`],
  });
  revalidatePortalProject(projectId);
  redirect(portalEventReturnPath(formData));
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
    redirect(portalEventReturnPath(formData));
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
  await notifyDeskOfSchedule({
    projectId,
    projectTitle: project.title,
    headline: `${person.name} cancelled “${event.title}”.`,
    details: ["Status: cancelled", `When: ${formatEventWhen(event.startsAt)}`],
  });
  revalidatePortalProject(projectId);
  redirect(portalEventReturnPath(formData));
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
  await notifyDeskOfSchedule({
    projectId,
    projectTitle: project.title,
    headline: `${person.name} requested a ${projectEventKindLabel(kindRaw).toLowerCase()}.`,
    details: [
      `Title: ${title}`,
      `When: ${formatEventWhen(startsAt)}`,
      notes ? `Notes: ${notes}` : null,
    ].filter((line): line is string => Boolean(line)),
  });
  revalidatePortalProject(projectId);
  redirect(portalEventReturnPath(formData));
}
