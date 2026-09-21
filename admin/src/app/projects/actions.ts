"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addNote,
  createChangeRequest,
  createDemo,
  createOption,
  createProject,
  createProjectEvent,
  deleteChangeRequest,
  deleteDemo,
  deleteNote,
  deleteOption,
  deleteProject,
  deleteProjectEvent,
  findOptionByKind,
  getAgreement,
  getChangeRequest,
  getClient,
  getDemo,
  getDiscovery,
  getLaunch,
  getMilestone,
  getNote,
  getOption,
  getPerson,
  getProject,
  getProjectEvent,
  getQualify,
  ensureProjectMilestones,
  listIntakeAnswers,
  listOptions,
  listPeople,
  listProjectMilestones,
  patchProject,
  saveIntakeAnswers,
  selectOption,
  setMilestoneDone,
  setProjectEventStatus,
  updateChangeRequest,
  updateDemo,
  updateMilestoneNote,
  updateNote,
  updateOption,
  updateProject,
  updateProjectEvent,
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
import { gateGuide, gateMoveBlock, isProcessGate, isProjectGate } from "@/lib/gates";
import { isUuid } from "@/lib/ids";
import { requireSessionUser } from "@/lib/current-user";
import { safeInternalPath } from "@/lib/paths";
import {
  isChangeStatus,
  isOptionKind,
  isProjectEventKind,
  isProjectEventStatus,
  isProjectStatus,
  isQualifyOutcome,
  optionKindLabel,
  projectEventKindLabel,
  projectEventStatusLabel,
  qualifyOutcomeLabel,
} from "@/lib/labels";
import { parseDatetimeLocal, formatEventWhen } from "@/lib/text";
import {
  confirmInboundDraftForProject,
  resendInboundVerifyForProject,
} from "@/lib/inbound-draft";
import { sendInboundVerifyEmail } from "@/lib/inbound-email";
import { emailReady } from "@/lib/notify-email";
import { INTAKE_QUESTIONS, isOptionStarterSummary } from "@/lib/templates";
import {
  notifyClientsOfMilestone,
  notifyClientsOfSchedule,
  notifyClientsOfStage,
} from "@/lib/notify";
import type {
  OptionKind,
  ProjectEventKind,
  ProjectEventStatus,
  ProjectStatus,
  QualifyOutcome,
  WorkKind,
} from "@/db/schema";

export type FormState = {
  error: string | null;
};

function revalidateProject(projectId: string, clientId: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/products");
  revalidatePath("/schedule");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/schedule`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}/schedule`);
  revalidatePath(`/portal/schedule`);
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

/** Keep the first checkpoint in sync with Qualify → Real. Returns a mail cue when state changed. */
async function syncQualifiedMilestoneFromOutcome(
  projectId: string,
  outcome: QualifyOutcome,
): Promise<{ label: string; done: boolean } | null> {
  const milestones = await ensureProjectMilestones(projectId);
  const qualified = milestones.find((row) => row.key === "qualified");
  if (!qualified) {
    return null;
  }

  const ordered = [...milestones].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime(),
  );
  const index = ordered.findIndex((row) => row.id === qualified.id);
  const laterDone =
    index >= 0 && ordered.slice(index + 1).some((row) => row.doneAt);

  if (outcome === "real") {
    if (qualified.doneAt) {
      return null;
    }
    await setMilestoneDone(qualified.id, true);
    await addNote(projectId, `Milestone done: ${qualified.label}.`);
    return { label: qualified.label, done: true };
  }

  if (!qualified.doneAt || laterDone) {
    return null;
  }

  await setMilestoneDone(qualified.id, false);
  await addNote(projectId, `Milestone reopened: ${qualified.label}.`);
  return { label: qualified.label, done: false };
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
    wantBuilt: readOptional(formData, "wantBuilt"),
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
      wantBuilt: readOptional(formData, "wantBuilt"),
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
    wantBuilt: readOptional(formData, "wantBuilt"),
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
  if (!isUuid(id) || !isProjectGate(toRaw) || !isProcessGate(toRaw)) {
    redirect("/projects");
  }

  const project = await getProject(id);
  if (!project) {
    redirect("/projects");
  }

  const [people, options, qualify, intake] = await Promise.all([
    listPeople(project.clientId),
    listOptions(id),
    getQualify(id),
    listIntakeAnswers(id),
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
  });
  if (block) {
    redirect(`/projects/${id}?notice=${block}`);
  }

  const fromLabel = gateGuide(project.currentGate).label;
  const toLabel = gateGuide(toRaw).label;
  await updateProjectGate(id, toRaw);
  await addNote(id, `Moved to ${toLabel}.`);
  await recordAudit({
    action: "gate.move",
    summary: `Moved “${project.title}” to ${toLabel}.`,
    entityType: "project",
    entityId: id,
    projectId: id,
    before: { currentGate: project.currentGate },
    after: { currentGate: toRaw },
  });
  if (project.workKind === "client") {
    await notifyClientsOfStage({
      clientId: project.clientId,
      projectId: id,
      projectTitle: project.title,
      fromLabel,
      toLabel,
    });
  }
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
    budgetNote: readOptional(formData, "budgetNote"),
    callAt: readOptional(formData, "callAt"),
    notes: readOptional(formData, "notes"),
  };
  const previousQualify = await getQualify(projectId);
  await upsertQualify(projectId, nextQualify);
  await patchProject(projectId, {
    wantBuilt: readOptional(formData, "wantBuilt"),
  });

  if (outcomeRaw === "no") {
    await patchProject(projectId, { status: "lost" });
    await addNote(
      projectId,
      "Disqualified at Qualify (not a real project). Pipeline closed.",
    );
  } else if (
    previousQualify?.outcome === "no" &&
    project.status === "lost"
  ) {
    await patchProject(projectId, { status: "active" });
    await addNote(
      projectId,
      `Qualify reopened as ${qualifyOutcomeLabel(outcomeRaw)}. Project set back to Active.`,
    );
  }

  const milestoneMail = await syncQualifiedMilestoneFromOutcome(
    projectId,
    outcomeRaw,
  );

  await recordAudit({
    action: "qualify.save",
    summary: `Saved qualify (${qualifyOutcomeLabel(outcomeRaw)}) on “${project.title}”.`,
    entityType: "qualify",
    entityId: projectId,
    projectId,
    before: previousQualify,
    after: nextQualify,
  });
  if (milestoneMail && project.workKind === "client") {
    await notifyClientsOfMilestone({
      clientId: project.clientId,
      projectId,
      projectTitle: project.title,
      milestoneLabel: milestoneMail.label,
      done: milestoneMail.done,
    });
  }
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

  const problem = nextIntake.find((row) => row.theme === "Problem")?.answer;
  const success = nextIntake.find((row) => row.theme === "Success")?.answer;
  const projectPatch: {
    problemSentence?: string | null;
    successLooksLike?: string | null;
  } = {};
  if (problem?.trim() && !project.problemSentence?.trim()) {
    projectPatch.problemSentence = problem.trim();
  }
  if (success?.trim() && !project.successLooksLike?.trim()) {
    projectPatch.successLooksLike = success.trim();
  }
  if (Object.keys(projectPatch).length > 0) {
    await patchProject(projectId, projectPatch);
  }

  await recordAudit({
    action: "discovery.answers-save",
    summary: `Saved discovery answers on “${project.title}”.`,
    entityType: "discovery",
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

  const previousDiscovery = await getDiscovery(projectId);
  const nextDiscovery = {
    callAt: readOptional(formData, "callAt"),
    attendees: readOptional(formData, "attendees"),
    currentProcess: previousDiscovery?.currentProcess ?? null,
    lastExample: readOptional(formData, "lastExample"),
    inScope: readOptional(formData, "inScope"),
    outOfScope: readOptional(formData, "outOfScope"),
    devicesLanguage: previousDiscovery?.devicesLanguage ?? null,
    privacyNotes: previousDiscovery?.privacyNotes ?? null,
  };
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

function parseEventFields(formData: FormData):
  | {
      ok: true;
      values: {
        kind: ProjectEventKind;
        title: string;
        status: ProjectEventStatus;
        startsAt: Date | null;
        endsAt: Date | null;
        location: string | null;
        notes: string | null;
      };
    }
  | { ok: false; error: string } {
  const kindRaw = readTrimmed(formData, "kind");
  if (!isProjectEventKind(kindRaw)) {
    return { ok: false, error: "Choose a kind." };
  }

  const title = readTrimmed(formData, "title");
  if (!title) {
    return { ok: false, error: "Title is required." };
  }

  const statusRaw = readTrimmed(formData, "status");
  if (!isProjectEventStatus(statusRaw)) {
    return { ok: false, error: "Choose a status." };
  }

  const startsAt = parseDatetimeLocal(readOptional(formData, "startsAt"));
  const endsAt = parseDatetimeLocal(readOptional(formData, "endsAt"));

  if (statusRaw !== "requested" && !startsAt) {
    return { ok: false, error: "Set a start time, or keep status as Requested." };
  }

  if (startsAt && endsAt && endsAt.getTime() < startsAt.getTime()) {
    return { ok: false, error: "End time must be after the start." };
  }

  return {
    ok: true,
    values: {
      kind: kindRaw,
      title,
      status: statusRaw,
      startsAt,
      endsAt,
      location: readOptional(formData, "location"),
      notes: readOptional(formData, "notes"),
    },
  };
}

export async function createProjectEventAction(
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
    return { error: "Schedule is for client projects." };
  }

  const parsed = parseEventFields(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const personIdRaw = readTrimmed(formData, "personId");
  let personId: string | null = null;
  if (personIdRaw) {
    if (!isUuid(personIdRaw)) {
      return { error: "Pick a valid person." };
    }
    const person = await getPerson(personIdRaw);
    if (!person || person.clientId !== project.clientId) {
      return { error: "That person is not on this client." };
    }
    personId = person.id;
  }

  const id = await createProjectEvent(projectId, {
    ...parsed.values,
    createdByKind: "operator",
    personId,
  });
  await addNote(
    projectId,
    `Scheduled ${projectEventKindLabel(parsed.values.kind).toLowerCase()}: ${parsed.values.title} (${projectEventStatusLabel(parsed.values.status).toLowerCase()}).`,
  );
  await recordAudit({
    action: "event.create",
    summary: `Scheduled “${parsed.values.title}” on “${project.title}”.`,
    entityType: "event",
    entityId: id,
    projectId,
    after: { ...parsed.values, personId },
  });
  if (project.workKind === "client") {
    await notifyClientsOfSchedule({
      clientId: project.clientId,
      projectId,
      projectTitle: project.title,
      headline: `Usman scheduled “${parsed.values.title}”.`,
      details: [
        `Kind: ${projectEventKindLabel(parsed.values.kind)}`,
        `Status: ${projectEventStatusLabel(parsed.values.status)}`,
        `When: ${formatEventWhen(parsed.values.startsAt)}`,
        parsed.values.location ? `Where: ${parsed.values.location}` : null,
      ].filter((line): line is string => Boolean(line)),
    });
  }
  revalidateProject(projectId, project.clientId);
  const next = readTrimmed(formData, "next");
  redirect(next === "/schedule" ? "/schedule" : `/projects/${projectId}`);
}

export async function updateProjectEventAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    return { error: "Event is missing." };
  }

  const project = await getProject(projectId);
  const event = await getProjectEvent(id);
  if (!project || !event || event.projectId !== projectId) {
    return { error: "That event is gone." };
  }

  const parsed = parseEventFields(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  await updateProjectEvent(id, parsed.values);
  if (event.status !== parsed.values.status) {
    await addNote(
      projectId,
      `Event “${parsed.values.title}” → ${projectEventStatusLabel(parsed.values.status).toLowerCase()}.`,
    );
  }
  await recordAudit({
    action: "event.update",
    summary: `Updated “${parsed.values.title}” on “${project.title}”.`,
    entityType: "event",
    entityId: id,
    projectId,
    before: event,
    after: parsed.values,
  });
  if (project.workKind === "client") {
    await notifyClientsOfSchedule({
      clientId: project.clientId,
      projectId,
      projectTitle: project.title,
      headline: `Schedule update on “${parsed.values.title}”.`,
      details: [
        `Status: ${projectEventStatusLabel(parsed.values.status)}`,
        `When: ${formatEventWhen(parsed.values.startsAt)}`,
        parsed.values.location ? `Where: ${parsed.values.location}` : null,
      ].filter((line): line is string => Boolean(line)),
    });
  }
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function setProjectEventStatusAction(formData: FormData) {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  const statusRaw = readTrimmed(formData, "status");
  if (!isUuid(id) || !isUuid(projectId) || !isProjectEventStatus(statusRaw)) {
    redirect("/projects");
  }

  const project = await getProject(projectId);
  const event = await getProjectEvent(id);
  if (!project || !event || event.projectId !== projectId) {
    redirect("/projects");
  }

  if (event.status === statusRaw) {
    redirect("/schedule");
  }

  await setProjectEventStatus(id, statusRaw);
  await addNote(
    projectId,
    `Event “${event.title}” → ${projectEventStatusLabel(statusRaw).toLowerCase()}.`,
  );
  await recordAudit({
    action: "event.status",
    summary: `Marked “${event.title}” ${projectEventStatusLabel(statusRaw).toLowerCase()} on “${project.title}”.`,
    entityType: "event",
    entityId: id,
    projectId,
    before: { status: event.status },
    after: { status: statusRaw },
  });
  if (project.workKind === "client") {
    await notifyClientsOfSchedule({
      clientId: project.clientId,
      projectId,
      projectTitle: project.title,
      headline: `“${event.title}” is now ${projectEventStatusLabel(statusRaw).toLowerCase()}.`,
      details: [`When: ${formatEventWhen(event.startsAt)}`],
    });
  }
  revalidateProject(projectId, project.clientId);
  redirect("/schedule");
}

export async function deleteProjectEventAction(formData: FormData) {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    redirect("/projects");
  }

  const project = await getProject(projectId);
  const event = await getProjectEvent(id);
  if (!project || !event || event.projectId !== projectId) {
    redirect("/projects");
  }

  bounceIfNotConfirmed(formData, `/projects/${projectId}`);
  await deleteProjectEvent(id);
  await addNote(projectId, `Removed schedule item “${event.title}”.`);
  await recordAudit({
    action: "event.delete",
    summary: `Removed “${event.title}” on “${project.title}”.`,
    entityType: "event",
    entityId: id,
    projectId,
    before: event,
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

export async function toggleMilestoneAction(formData: FormData) {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  const doneRaw = readTrimmed(formData, "done");
  if (!isUuid(id) || !isUuid(projectId)) {
    redirect("/projects");
  }

  const project = await getProject(projectId);
  const milestone = await getMilestone(id);
  if (!project || !milestone || milestone.projectId !== projectId) {
    redirect("/projects");
  }

  if (project.status === "lost" || project.status === "won" || project.status === "done") {
    redirect(`/projects/${projectId}?notice=status`);
  }

  const done = doneRaw === "1";
  const all = await listProjectMilestones(projectId);
  const ordered = [...all].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.createdAt.getTime() - b.createdAt.getTime(),
  );
  const index = ordered.findIndex((row) => row.id === id);
  if (index < 0) {
    redirect(`/projects/${projectId}`);
  }

  if (done) {
    const priorOpen = ordered
      .slice(0, index)
      .some((row) => !row.doneAt);
    if (priorOpen) {
      redirect(`/projects/${projectId}?notice=milestone-order`);
    }
  } else {
    const laterDone = ordered.slice(index + 1).some((row) => row.doneAt);
    if (laterDone) {
      redirect(`/projects/${projectId}?notice=milestone-reopen`);
    }
  }

  await setMilestoneDone(id, done);
  await addNote(
    projectId,
    done
      ? `Milestone done: ${milestone.label}.`
      : `Milestone reopened: ${milestone.label}.`,
  );
  await recordAudit({
    action: done ? "milestone.done" : "milestone.reopen",
    summary: `${done ? "Completed" : "Reopened"} milestone “${milestone.label}” on “${project.title}”.`,
    entityType: "milestone",
    entityId: id,
    projectId,
    before: { doneAt: milestone.doneAt },
    after: { done },
  });
  if (project.workKind === "client") {
    await notifyClientsOfMilestone({
      clientId: project.clientId,
      projectId,
      projectTitle: project.title,
      milestoneLabel: milestone.label,
      done,
    });
  }
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function saveMilestoneNoteAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    return { error: "Milestone is missing." };
  }

  const project = await getProject(projectId);
  const milestone = await getMilestone(id);
  if (!project || !milestone || milestone.projectId !== projectId) {
    return { error: "That milestone is gone." };
  }

  const note = readOptional(formData, "note");
  await updateMilestoneNote(id, note);
  await recordAudit({
    action: "milestone.note",
    summary: `Updated note on milestone “${milestone.label}”.`,
    entityType: "milestone",
    entityId: id,
    projectId,
    before: { note: milestone.note },
    after: { note },
  });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

function redirectWithNotice(path: string, notice: string): never {
  const safe = safeInternalPath(path);
  const hashIndex = safe.indexOf("#");
  const withoutHash = hashIndex >= 0 ? safe.slice(0, hashIndex) : safe;
  const hash = hashIndex >= 0 ? safe.slice(hashIndex) : "";
  const queryIndex = withoutHash.indexOf("?");
  const pathname =
    queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const search = queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "";
  const params = new URLSearchParams(search);
  params.set("notice", notice);
  redirect(`${pathname}?${params.toString()}${hash}`);
}

export async function confirmInboundEmailAction(formData: FormData) {
  const user = await requireSessionUser();
  const projectId = readTrimmed(formData, "projectId");
  const next = readTrimmed(formData, "next") || `/projects/${projectId}`;
  if (!isUuid(projectId)) {
    redirect("/projects");
  }

  const result = await confirmInboundDraftForProject(projectId, user.email);
  const project = await getProject(projectId);
  if (project) {
    revalidateProject(projectId, project.clientId);
  }
  if (!result.ok) {
    redirectWithNotice(next, "inbound-confirm-failed");
  }
  redirectWithNotice(
    next,
    result.alreadyDone ? "inbound-already" : "inbound-confirmed",
  );
}

export async function resendInboundEmailAction(formData: FormData) {
  await requireSessionUser();
  const projectId = readTrimmed(formData, "projectId");
  const next = readTrimmed(formData, "next") || `/projects/${projectId}`;
  if (!isUuid(projectId)) {
    redirect("/projects");
  }

  const issued = await resendInboundVerifyForProject(projectId);
  if (!issued) {
    redirectWithNotice(next, "inbound-resend-missing");
  }
  if (!emailReady()) {
    redirectWithNotice(next, "inbound-resend-failed");
  }

  const mail = await sendInboundVerifyEmail({
    to: issued.email,
    name: issued.name,
    verifyUrl: issued.verifyUrl,
  });
  if (!mail.sent) {
    console.error("Desk inbound confirm resend failed", mail.error);
    redirectWithNotice(next, "inbound-resend-failed");
  }

  const project = await getProject(projectId);
  if (project) {
    revalidateProject(projectId, project.clientId);
  }
  redirectWithNotice(next, "inbound-resent");
}
