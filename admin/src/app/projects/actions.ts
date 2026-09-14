"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addNote,
  createOption,
  createProject,
  deleteOption,
  findOptionByKind,
  getClient,
  getOption,
  getProject,
  listPeople,
  selectOption,
  updateOption,
  updateProject,
  updateProjectGate,
} from "@/db/queries";
import { readOptional, readTrimmed } from "@/lib/forms";
import { gateMoveBlock, isProjectGate } from "@/lib/gates";
import { isUuid } from "@/lib/ids";
import { isOptionKind, isProjectStatus } from "@/lib/labels";
import type { OptionKind, ProjectStatus } from "@/db/schema";

export type FormState = {
  error: string | null;
};

function revalidateProject(projectId: string, clientId: string) {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/clients/${clientId}`);
}

export async function createProjectAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const clientId = readTrimmed(formData, "clientId");
  if (!isUuid(clientId)) {
    return { error: "Pick a client." };
  }

  const client = await getClient(clientId);
  if (!client) {
    return { error: "That client is gone." };
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

  revalidateProject(id, clientId);
  redirect(`/projects/${id}`);
}

export async function updateProjectAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
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

  await updateProject(id, {
    title,
    problemSentence: readOptional(formData, "problemSentence"),
    successLooksLike: readOptional(formData, "successLooksLike"),
    budgetNote: readOptional(formData, "budgetNote"),
    deadlineNote: readOptional(formData, "deadlineNote"),
    status,
  });

  revalidateProject(id, project.clientId);
  redirect(`/projects/${id}`);
}

export async function moveGateAction(formData: FormData) {
  const id = readTrimmed(formData, "id");
  const toRaw = readTrimmed(formData, "gate");
  if (!isUuid(id) || !isProjectGate(toRaw)) {
    redirect("/projects");
  }

  const project = await getProject(id);
  if (!project) {
    redirect("/projects");
  }

  const people = await listPeople(project.clientId);
  const block = gateMoveBlock({
    from: project.currentGate,
    to: toRaw,
    people,
  });
  if (block) {
    redirect(`/projects/${id}?notice=${block}`);
  }

  await updateProjectGate(id, toRaw);
  revalidateProject(id, project.clientId);
  redirect(`/projects/${id}`);
}

export async function addNoteAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
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

  await addNote(projectId, body);
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

function parseOptionFields(formData: FormData):
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
    return { ok: false, error: "Summary is required." };
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

  const parsed = parseOptionFields(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  await createOption(projectId, { kind, ...parsed.values });
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function updateOptionAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
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

  const parsed = parseOptionFields(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  await updateOption(id, parsed.values);
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function deleteOptionAction(formData: FormData) {
  const id = readTrimmed(formData, "id");
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(id) || !isUuid(projectId)) {
    redirect("/projects");
  }

  const project = await getProject(projectId);
  const option = await getOption(id);
  if (project && option && option.projectId === projectId) {
    await deleteOption(id);
    revalidateProject(projectId, project.clientId);
  }

  redirect(`/projects/${projectId}`);
}

export async function selectOptionAction(formData: FormData) {
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

  await selectOption(projectId, id);
  revalidateProject(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}
