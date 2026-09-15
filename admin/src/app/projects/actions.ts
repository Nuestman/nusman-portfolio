"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addNote,
  createChangeRequest,
  createDemo,
  createOption,
  createProject,
  deleteChangeRequest,
  deleteDemo,
  deleteNote,
  deleteOption,
  deleteProject,
  findOptionByKind,
  getAgreement,
  getChangeRequest,
  getClient,
  getDemo,
  getDiscovery,
  getLaunch,
  getNote,
  getOption,
  getProject,
  getQualify,
  listIntakeAnswers,
  listOptions,
  listPeople,
  saveIntakeAnswers,
  selectOption,
  updateChangeRequest,
  updateDemo,
  updateNote,
  updateOption,
  updateProject,
  updateProjectGate,
  upsertAgreement,
  upsertDiscovery,
  upsertLaunch,
  upsertQualify,
} from "@/db/queries";
import {
  deleteWasConfirmed,
  readDeleteReason,
  recordAudit,
  typedNameMatches,
} from "@/lib/audit";
import { readChecked, readOptional, readTrimmed } from "@/lib/forms";
import { gateGuide, gateMoveBlock, isProjectGate } from "@/lib/gates";
import { isUuid } from "@/lib/ids";
import { requireSessionUser } from "@/lib/current-user";
import { safeInternalPath } from "@/lib/paths";
import {
  isChangeStatus,
  isOptionKind,
  isProjectStatus,
  isQualifyOutcome,
  optionKindLabel,
  qualifyOutcomeLabel,
} from "@/lib/labels";
import { INTAKE_QUESTIONS, isOptionStarterSummary } from "@/lib/templates";
import type { OptionKind, ProjectStatus, WorkKind } from "@/db/schema";

export type FormState = {
  error: string | null;
};

function revalidateProject(projectId: string, clientId: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/products");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/portal/projects/${projectId}`);
}

function projectListPath(formData: FormData, workKind: WorkKind): string {
  const next = readTrimmed(formData, "next");
  if (next) {
    return safeInternalPath(next);
  }
  return workKind === "product" ? "/products" : "/projects";
}

function bounceIfNotConfirmed(formData: FormData, href: string) {
  if (!deleteWasConfirmed(formData)) {
    redirect(href);
  }
}

export async function createProjectAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const clientId = readTrimmed(formData, "clientId");
  if (!isUuid(clientId)) {
    return { error: "Pick a client." };
  }

  const client = await getClient(clientId);
  if (!client) {
    return { error: "That client is gone." };
  }
  if (client.kind === "practice") {
    return { error: "Own products are added from Products, not here." };
  }

  const title = readTrimmed(formData, "title");
  if (!title) {
    return { error: "Title is required." };
  }

  const id = await createProject({
    clientId,
    title,
    problemSentence: readOptional(formData, "problemSentence"),
    successLooksLike: readOptional(formData, "successLooksLike"),
  });

  await addNote(id, `Opened at ${gateGuide("qualify").label}.`);
  await recordAudit({
    action: "project.create",
    summary: `Opened project “${title}”.`,
    entityType: "project",
    entityId: id,
    projectId: id,
    after: {
      clientId,
      title,
      problemSentence: readOptional(formData, "problemSentence"),
      successLooksLike: readOptional(formData, "successLooksLike"),
    },
  });
  revalidateProject(id, clientId);
  redirect(`/projects/${id}`);
}

export async function updateProjectAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  if (!isUuid(id)) {
    return { error: "Project is missing." };
  }

  const project = await getProject(id);
  if (!project) {
    return { error: "That project is gone." };
  }

  const title = readTrimmed(formData, "title");
  if (!title) {
    return { error: "Title is required." };
  }

  const statusRaw = readTrimmed(formData, "status");
  if (!isProjectStatus(statusRaw)) {
    return { error: "Choose a valid status." };
  }
  const status: ProjectStatus = statusRaw;

  const nextValues = {
    title,
    problemSentence: readOptional(formData, "problemSentence"),
    successLooksLike: readOptional(formData, "successLooksLike"),
    budgetNote: readOptional(formData, "budgetNote"),
    deadlineNote: readOptional(formData, "deadlineNote"),
    status,
  };
  await updateProject(id, nextValues);
  await recordAudit({
    action: "project.update",
    summary: `Updated project “${title}”.`,
    entityType: "project",
    entityId: id,
    projectId: id,
    before: project,
    after: nextValues,
  });

  revalidateProject(id, project.clientId);
  redirect(`/projects/${id}`);
}

export async function deleteProjectAction(formData: FormData) {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  if (!isUuid(id)) {
    redirect("/projects");
  }

  const project = await getProject(id);
  if (!project) {
    redirect("/projects");
  }

  const next = projectListPath(formData, project.workKind);
  if (!deleteWasConfirmed(formData) || !typedNameMatches(formData, project.title)) {
    redirect(`/projects/${id}?notice=confirm-title`);
  }

  await deleteProject(id);
  await recordAudit({
    action: "project.delete",
    summary: `Deleted ${project.workKind === "product" ? "product" : "project"} “${project.title}”.`,
    entityType: "project",
    entityId: id,
    before: project,
    reason: readDeleteReason(formData),
  });
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/products");
  revalidatePath(`/clients/${project.clientId}`);
  revalidatePath(next);
  redirect(next);
}

export async function moveGateAction(formData: FormData) {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const toRaw = readTrimmed(formData, "gate");
  if (!isUuid(id) || !isProjectGate(toRaw)) {
    redirect("/projects");
  }

  const project = await getProject(id);
  if (!project) {
    redirect("/projects");
  }

  const [people, options, qualify, intake, agreement] = await Promise.all([
    listPeople(project.clientId),
    listOptions(id),
    getQualify(id),
    listIntakeAnswers(id),
    getAgreement(id),
  ]);
  const problemAnswer =
    intake.find((row) => row.theme === "Problem")?.answer ?? null;
  const successAnswer =
    intake.find((row) => row.theme === "Success")?.answer ?? null;
  const block = gateMoveBlock({
    from: project.currentGate,
    to: toRaw,
    people,
    problemSentence: project.problemSentence,
    status: project.status,
    workKind: project.workKind,
    hasSelectedOption: options.some((option) => option.selected),
    qualifyOutcome: qualify?.outcome ?? "undecided",
    intakeProblemAnswer: problemAnswer,
    intakeSuccessAnswer: successAnswer,
    depositPaid: agreement?.depositPaid ?? false,
    agreementConfirmed: agreement?.confirmed ?? false,
  });
  if (block) {
    redirect(`/projects/${id}?notice=${block}`);
  }

  await updateProjectGate(id, toRaw);
  await addNote(id, `Moved to ${gateGuide(toRaw).label}.`);
  await recordAudit({
    action: "gate.move",
    summary: `Moved “${project.title}” to ${gateGuide(toRaw).label}.`,
    entityType: "project",
    entityId: id,
    projectId: id,
    before: { currentGate: project.currentGate },
    after: { currentGate: toRaw },
  });
  revalidateProject(id, project.clientId);
  redirect(`/projects/${id}`);
}

export async function addNoteAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(projectId)) {
    return { error: "Project is missing." };
  }

  const project = await getProject(projectId);
  if (!project) {
    return { error: "That project is gone." };
  }

  const body = readTrimmed(formData, "body");
  if (!body) {
    return { error: "Write a note first." };
  }

  const clientVisible = formData.get("clientVisible") === "on";
  await addNote(projectId, body, clientVisible);
  await recordAudit({
    action: "note.create",
    summary: `Added a timeline note on “${project.title}”.`,
    entityType: "note",
    projectId,
    after: { body, clientVisible },
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function updateNoteAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    return { error: "Note is missing." };
  }

  const project = await getProject(projectId);
  const note = await getNote(id);
  if (!project || !note || note.projectId !== projectId) {
    return { error: "That note is gone." };
  }

  const body = readTrimmed(formData, "body");
  if (!body) {
    return { error: "Write a note first." };
  }

  const clientVisible = formData.get("clientVisible") === "on";
  await updateNote(id, body, clientVisible);
  await recordAudit({
    action: "note.update",
    summary: `Updated a timeline note on “${project.title}”.`,
    entityType: "note",
    entityId: id,
    projectId,
    before: note,
    after: { body, clientVisible },
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function deleteNoteAction(formData: FormData) {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    redirect("/projects");
  }

  const project = await getProject(projectId);
  const note = await getNote(id);
  if (!project || !note || note.projectId !== projectId) {
    redirect("/projects");
  }

  bounceIfNotConfirmed(formData, `/projects/${projectId}`);
  await deleteNote(id);
  await recordAudit({
    action: "note.delete",
    summary: `Removed a timeline note on “${project.title}”.`,
    entityType: "note",
    entityId: id,
    projectId,
    before: note,
    reason: readDeleteReason(formData),
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

function parseOptionFields(
  formData: FormData,
  kind: OptionKind,
):
  | {
      ok: true;
      values: {
        summary: string;
        priceNote: string | null;
        timelineNote: string | null;
        inScope: string | null;
        outOfScope: string | null;
      };
    }
  | { ok: false; error: string } {
  const summary = readTrimmed(formData, "summary");
  if (!summary) {
    return { ok: false, error: "Client summary is required." };
  }
  if (isOptionStarterSummary(summary, kind)) {
    return {
      ok: false,
      error:
        "Replace the coaching hint with a client-facing summary. Clients see this on the portal.",
    };
  }

  return {
    ok: true,
    values: {
      summary,
      priceNote: readOptional(formData, "priceNote"),
      timelineNote: readOptional(formData, "timelineNote"),
      inScope: readOptional(formData, "inScope"),
      outOfScope: readOptional(formData, "outOfScope"),
    },
  };
}

export async function createOptionAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(projectId)) {
    return { error: "Project is missing." };
  }

  const project = await getProject(projectId);
  if (!project) {
    return { error: "That project is gone." };
  }

  const kindRaw = readTrimmed(formData, "kind");
  if (!isOptionKind(kindRaw)) {
    return { error: "Choose light, recommended, or later." };
  }
  const kind: OptionKind = kindRaw;

  const existing = await findOptionByKind(projectId, kind);
  if (existing) {
    return { error: "That package is already on this project. Edit it instead." };
  }

  const parsed = parseOptionFields(formData, kind);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  await createOption(projectId, { kind, ...parsed.values });
  await recordAudit({
    action: "option.create",
    summary: `Added ${optionKindLabel(kind)} on “${project.title}”.`,
    entityType: "option",
    projectId,
    after: { kind, ...parsed.values },
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function updateOptionAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    return { error: "Option is missing." };
  }

  const project = await getProject(projectId);
  const option = await getOption(id);
  if (!project || !option || option.projectId !== projectId) {
    return { error: "That option is gone." };
  }

  const parsed = parseOptionFields(formData, option.kind);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  await updateOption(id, parsed.values);
  await recordAudit({
    action: "option.update",
    summary: `Updated ${optionKindLabel(option.kind)} on “${project.title}”.`,
    entityType: "option",
    entityId: id,
    projectId,
    before: option,
    after: parsed.values,
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function deleteOptionAction(formData: FormData) {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    redirect("/projects");
  }

  const project = await getProject(projectId);
  const option = await getOption(id);
  if (!project || !option || option.projectId !== projectId) {
    redirect("/projects");
  }
  if (option.selected) {
    redirect(`/projects/${projectId}?notice=chosen-option`);
  }

  bounceIfNotConfirmed(formData, `/projects/${projectId}`);
  await deleteOption(id);
  await recordAudit({
    action: "option.delete",
    summary: `Removed ${optionKindLabel(option.kind)} on “${project.title}”.`,
    entityType: "option",
    entityId: id,
    projectId,
    before: option,
    reason: readDeleteReason(formData),
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function selectOptionAction(formData: FormData) {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    redirect("/projects");
  }

  const project = await getProject(projectId);
  const option = await getOption(id);
  if (!project || !option || option.projectId !== projectId) {
    redirect("/projects");
  }

  if (option.selected) {
    redirect(`/projects/${projectId}`);
  }

  if (isOptionStarterSummary(option.summary, option.kind)) {
    redirect(`/projects/${projectId}?notice=option-client-summary`);
  }

  const previouslyChosen = (await listOptions(projectId)).find((row) => row.selected);
  await selectOption(projectId, id);
  await addNote(projectId, `Chose ${optionKindLabel(option.kind)}.`);
  await recordAudit({
    action: "option.choose",
    summary: `Chose ${optionKindLabel(option.kind)} on “${project.title}”.`,
    entityType: "option",
    entityId: id,
    projectId,
    before: {
      chosenId: previouslyChosen?.id ?? null,
      kind: previouslyChosen?.kind ?? null,
    },
    after: { chosenId: id, kind: option.kind },
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

const PRODUCTS_SKIP_SALES = "Own products skip sales and discovery forms.";

export async function saveQualifyAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(projectId)) {
    return { error: "Project is missing." };
  }

  const project = await getProject(projectId);
  if (!project) {
    return { error: "That project is gone." };
  }
  if (project.workKind === "product") {
    return { error: PRODUCTS_SKIP_SALES };
  }

  const outcomeRaw = readTrimmed(formData, "outcome");
  if (!isQualifyOutcome(outcomeRaw)) {
    return { error: "Choose a qualify outcome." };
  }

  const nextQualify = {
    outcome: outcomeRaw,
    whoFor: readOptional(formData, "whoFor"),
    painToday: readOptional(formData, "painToday"),
    neededBy: readOptional(formData, "neededBy"),
    callAt: readOptional(formData, "callAt"),
    notes: readOptional(formData, "notes"),
  };
  const previousQualify = await getQualify(projectId);
  await upsertQualify(projectId, nextQualify);
  await recordAudit({
    action: "qualify.save",
    summary: `Saved qualify (${qualifyOutcomeLabel(outcomeRaw)}) on “${project.title}”.`,
    entityType: "qualify",
    entityId: projectId,
    projectId,
    before: previousQualify,
    after: nextQualify,
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function saveIntakeAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(projectId)) {
    return { error: "Project is missing." };
  }

  const project = await getProject(projectId);
  if (!project) {
    return { error: "That project is gone." };
  }
  if (project.workKind === "product") {
    return { error: PRODUCTS_SKIP_SALES };
  }

  const previousIntake = await listIntakeAnswers(projectId);
  const nextIntake = INTAKE_QUESTIONS.map((item) => ({
    theme: item.theme,
    ask: item.ask,
    answer: readOptional(formData, `answer_${item.theme}`),
  }));
  await saveIntakeAnswers(projectId, nextIntake);
  await recordAudit({
    action: "intake.save",
    summary: `Saved intake answers on “${project.title}”.`,
    entityType: "intake",
    projectId,
    before: previousIntake.map((row) => ({
      theme: row.theme,
      ask: row.ask,
      answer: row.answer,
    })),
    after: nextIntake,
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function saveDiscoveryAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(projectId)) {
    return { error: "Project is missing." };
  }

  const project = await getProject(projectId);
  if (!project) {
    return { error: "That project is gone." };
  }
  if (project.workKind === "product") {
    return { error: PRODUCTS_SKIP_SALES };
  }

  const nextDiscovery = {
    callAt: readOptional(formData, "callAt"),
    attendees: readOptional(formData, "attendees"),
    currentProcess: readOptional(formData, "currentProcess"),
    lastExample: readOptional(formData, "lastExample"),
    inScope: readOptional(formData, "inScope"),
    outOfScope: readOptional(formData, "outOfScope"),
    devicesLanguage: readOptional(formData, "devicesLanguage"),
    privacyNotes: readOptional(formData, "privacyNotes"),
  };
  const previousDiscovery = await getDiscovery(projectId);
  await upsertDiscovery(projectId, nextDiscovery);
  await recordAudit({
    action: "discovery.save",
    summary: `Saved discovery on “${project.title}”.`,
    entityType: "discovery",
    entityId: projectId,
    projectId,
    before: previousDiscovery,
    after: nextDiscovery,
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function saveAgreementAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(projectId)) {
    return { error: "Project is missing." };
  }

  const project = await getProject(projectId);
  if (!project) {
    return { error: "That project is gone." };
  }
  if (project.workKind === "product") {
    return { error: PRODUCTS_SKIP_SALES };
  }

  const nextAgreement = {
    parties: readOptional(formData, "parties"),
    outcome: readOptional(formData, "outcome"),
    scope: readOptional(formData, "scope"),
    money: readOptional(formData, "money"),
    time: readOptional(formData, "time"),
    changes: readOptional(formData, "changes"),
    support: readOptional(formData, "support"),
    workplace: readOptional(formData, "workplace"),
    depositPaid: readChecked(formData, "depositPaid"),
    confirmed: readChecked(formData, "confirmed"),
  };
  const previousAgreement = await getAgreement(projectId);
  await upsertAgreement(projectId, nextAgreement);
  await recordAudit({
    action: "agreement.save",
    summary: `Saved agreement on “${project.title}”.`,
    entityType: "agreement",
    entityId: projectId,
    projectId,
    before: previousAgreement,
    after: nextAgreement,
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function createChangeRequestAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(projectId)) {
    return { error: "Project is missing." };
  }

  const project = await getProject(projectId);
  if (!project) {
    return { error: "That project is gone." };
  }

  const body = readTrimmed(formData, "body");
  if (!body) {
    return { error: "Write the change request first." };
  }

  const statusRaw = readTrimmed(formData, "status");
  if (!isChangeStatus(statusRaw)) {
    return { error: "Choose parked, priced, or done." };
  }

  await createChangeRequest(projectId, { body, status: statusRaw });
  await recordAudit({
    action: "change.create",
    summary: `Added a change request on “${project.title}”.`,
    entityType: "change",
    projectId,
    after: { body, status: statusRaw },
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function updateChangeRequestAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    return { error: "Change request is missing." };
  }

  const project = await getProject(projectId);
  const change = await getChangeRequest(id);
  if (!project || !change || change.projectId !== projectId) {
    return { error: "That change request is gone." };
  }

  const body = readTrimmed(formData, "body");
  if (!body) {
    return { error: "Write the change request first." };
  }

  const statusRaw = readTrimmed(formData, "status");
  if (!isChangeStatus(statusRaw)) {
    return { error: "Choose parked, priced, or done." };
  }

  await updateChangeRequest(id, { body, status: statusRaw });
  await recordAudit({
    action: "change.update",
    summary: `Updated a change request on “${project.title}”.`,
    entityType: "change",
    entityId: id,
    projectId,
    before: change,
    after: { body, status: statusRaw },
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function deleteChangeRequestAction(formData: FormData) {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    redirect("/projects");
  }

  const project = await getProject(projectId);
  const change = await getChangeRequest(id);
  if (!project || !change || change.projectId !== projectId) {
    redirect("/projects");
  }

  bounceIfNotConfirmed(formData, `/projects/${projectId}`);
  await deleteChangeRequest(id);
  await recordAudit({
    action: "change.delete",
    summary: `Removed a change request on “${project.title}”.`,
    entityType: "change",
    entityId: id,
    projectId,
    before: change,
    reason: readDeleteReason(formData),
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function createDemoAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(projectId)) {
    return { error: "Project is missing." };
  }

  const project = await getProject(projectId);
  if (!project) {
    return { error: "That project is gone." };
  }

  const notes = readTrimmed(formData, "notes");
  if (!notes) {
    return { error: "Write what happened in the demo." };
  }

  const nextDemo = {
    happenedAt: readOptional(formData, "happenedAt"),
    notes,
  };
  await createDemo(projectId, nextDemo);
  await recordAudit({
    action: "demo.create",
    summary: `Added a demo on “${project.title}”.`,
    entityType: "demo",
    projectId,
    after: nextDemo,
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function updateDemoAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    return { error: "Demo is missing." };
  }

  const project = await getProject(projectId);
  const demo = await getDemo(id);
  if (!project || !demo || demo.projectId !== projectId) {
    return { error: "That demo is gone." };
  }

  const notes = readTrimmed(formData, "notes");
  if (!notes) {
    return { error: "Write what happened in the demo." };
  }

  const nextDemo = {
    happenedAt: readOptional(formData, "happenedAt"),
    notes,
  };
  await updateDemo(id, nextDemo);
  await recordAudit({
    action: "demo.update",
    summary: `Updated a demo on “${project.title}”.`,
    entityType: "demo",
    entityId: id,
    projectId,
    before: demo,
    after: nextDemo,
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function deleteDemoAction(formData: FormData) {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    redirect("/projects");
  }

  const project = await getProject(projectId);
  const demo = await getDemo(id);
  if (!project || !demo || demo.projectId !== projectId) {
    redirect("/projects");
  }

  bounceIfNotConfirmed(formData, `/projects/${projectId}`);
  await deleteDemo(id);
  await recordAudit({
    action: "demo.delete",
    summary: `Removed a demo on “${project.title}”.`,
    entityType: "demo",
    entityId: id,
    projectId,
    before: demo,
    reason: readDeleteReason(formData),
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function saveLaunchAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(projectId)) {
    return { error: "Project is missing." };
  }

  const project = await getProject(projectId);
  if (!project) {
    return { error: "That project is gone." };
  }

  const nextLaunch = {
    trained: readChecked(formData, "trained"),
    guideLeft: readChecked(formData, "guideLeft"),
    remainingInvoiced: readChecked(formData, "remainingInvoiced"),
    maintenanceOffered: readChecked(formData, "maintenanceOffered"),
    handoverNote: readOptional(formData, "handoverNote"),
  };
  const previousLaunch = await getLaunch(projectId);
  await upsertLaunch(projectId, nextLaunch);
  await recordAudit({
    action: "launch.save",
    summary: `Saved launch on “${project.title}”.`,
    entityType: "launch",
    entityId: projectId,
    projectId,
    before: previousLaunch,
    after: nextLaunch,
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}
