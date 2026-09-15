"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  countProjectsForClient,
  createClient,
  createPerson,
  deleteClient,
  deletePerson,
  getClient,
  getPerson,
  listProjectsForClient,
  updateClient,
  updatePerson,
} from "@/db/queries";
import {
  deleteWasConfirmed,
  readDeleteReason,
  recordAudit,
} from "@/lib/audit";
import { readOptional, readTrimmed, looksLikeEmail } from "@/lib/forms";
import { isUuid } from "@/lib/ids";
import { requireSessionUser } from "@/lib/current-user";
import { isClientSource, isPersonRole } from "@/lib/labels";
import type { ClientSource, PersonRole } from "@/db/schema";

export type FormState = {
  error: string | null;
};

const PRACTICE_CLIENTS_MESSAGE =
  "Practice people live with Products, not Clients.";

async function revalidateClient(clientId: string) {
  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/");
  revalidatePath("/projects");
  const clientProjects = await listProjectsForClient(clientId);
  for (const project of clientProjects) {
    revalidatePath(`/projects/${project.id}`);
  }
}

function parseClientFields(formData: FormData):
  | {
      ok: true;
      values: {
        name: string;
        email: string | null;
        phone: string | null;
        organisation: string | null;
        source: ClientSource | null;
        notes: string | null;
      };
    }
  | { ok: false; error: string } {
  const name = readTrimmed(formData, "name");
  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  const email = readOptional(formData, "email");
  if (email && !looksLikeEmail(email)) {
    return { ok: false, error: "Email does not look right." };
  }

  const sourceRaw = readTrimmed(formData, "source");
  let source: ClientSource | null = null;
  if (sourceRaw) {
    if (!isClientSource(sourceRaw)) {
      return { ok: false, error: "Choose a valid source." };
    }
    source = sourceRaw;
  }

  return {
    ok: true,
    values: {
      name,
      email,
      phone: readOptional(formData, "phone"),
      organisation: readOptional(formData, "organisation"),
      source,
      notes: readOptional(formData, "notes"),
    },
  };
}

function parsePersonFields(formData: FormData):
  | {
      ok: true;
      values: {
        name: string;
        email: string | null;
        phone: string | null;
        role: PersonRole;
        isDecisionMaker: boolean;
        notes: string | null;
      };
    }
  | { ok: false; error: string } {
  const name = readTrimmed(formData, "name");
  if (!name) {
    return { ok: false, error: "Name is required." };
  }

  const roleRaw = readTrimmed(formData, "role");
  if (!isPersonRole(roleRaw)) {
    return { ok: false, error: "Choose buyer, daily user, or other." };
  }

  const email = readOptional(formData, "email");
  if (email && !looksLikeEmail(email)) {
    return { ok: false, error: "Email does not look right." };
  }

  return {
    ok: true,
    values: {
      name,
      email,
      phone: readOptional(formData, "phone"),
      role: roleRaw,
      isDecisionMaker: formData.get("isDecisionMaker") === "on",
      notes: readOptional(formData, "notes"),
    },
  };
}

export async function createClientAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const parsed = parseClientFields(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const id = await createClient(parsed.values);
  await recordAudit({
    action: "client.create",
    summary: `Added client “${parsed.values.name}”.`,
    entityType: "client",
    entityId: id,
    after: parsed.values,
  });
  await revalidateClient(id);
  redirect(`/clients/${id}`);
}

export async function updateClientAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  if (!isUuid(id)) {
    return { error: "Client is missing." };
  }

  const parsed = parseClientFields(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const existing = await getClient(id);
  if (!existing) {
    return { error: "That client is gone." };
  }
  if (existing.kind === "practice") {
    return { error: PRACTICE_CLIENTS_MESSAGE };
  }

  await updateClient(id, parsed.values);
  await recordAudit({
    action: "client.update",
    summary: `Updated client “${parsed.values.name}”.`,
    entityType: "client",
    entityId: id,
    before: existing,
    after: parsed.values,
  });
  await revalidateClient(id);
  redirect(`/clients/${id}`);
}

export async function deleteClientAction(formData: FormData) {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  if (!isUuid(id)) {
    redirect("/clients");
  }

  const client = await getClient(id);
  if (!client || client.kind === "practice") {
    redirect("/clients");
  }

  const projectCount = await countProjectsForClient(id);
  if (projectCount > 0) {
    redirect(`/clients/${id}?notice=has-projects`);
  }

  if (!deleteWasConfirmed(formData)) {
    redirect(`/clients/${id}`);
  }

  await deleteClient(id);
  await recordAudit({
    action: "client.delete",
    summary: `Deleted client “${client.name}”.`,
    entityType: "client",
    entityId: id,
    before: client,
    reason: readDeleteReason(formData),
  });
  revalidatePath("/clients");
  revalidatePath("/");
  revalidatePath("/projects");
  redirect("/clients");
}

export async function createPersonAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const clientId = readTrimmed(formData, "clientId");
  if (!isUuid(clientId)) {
    return { error: "Client is missing." };
  }

  const client = await getClient(clientId);
  if (!client) {
    return { error: "That client is gone." };
  }
  if (client.kind === "practice") {
    return { error: PRACTICE_CLIENTS_MESSAGE };
  }

  const parsed = parsePersonFields(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  await createPerson({ clientId, ...parsed.values });
  await recordAudit({
    action: "person.create",
    summary: `Added ${parsed.values.name} to “${client.name}”.`,
    entityType: "person",
    after: { clientId, ...parsed.values },
  });
  await revalidateClient(clientId);
  redirect(`/clients/${clientId}`);
}

export async function updatePersonAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const clientId = readTrimmed(formData, "clientId");
  if (!isUuid(id) || !isUuid(clientId)) {
    return { error: "Person is missing." };
  }

  const parsed = parsePersonFields(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const person = await getPerson(id);
  if (!person || person.clientId !== clientId) {
    return { error: "That person is gone." };
  }

  const client = await getClient(clientId);
  if (!client || client.kind === "practice") {
    return { error: PRACTICE_CLIENTS_MESSAGE };
  }

  await updatePerson(id, parsed.values);
  await recordAudit({
    action: "person.update",
    summary: `Updated ${parsed.values.name} on “${client.name}”.`,
    entityType: "person",
    entityId: id,
    before: person,
    after: parsed.values,
  });
  await revalidateClient(clientId);
  redirect(`/clients/${clientId}`);
}

export async function deletePersonAction(formData: FormData) {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const clientId = readTrimmed(formData, "clientId");
  if (!isUuid(id) || !isUuid(clientId)) {
    redirect("/clients");
  }

  const person = await getPerson(id);
  if (!person || person.clientId !== clientId) {
    redirect("/clients");
  }

  const client = await getClient(clientId);
  if (!client || client.kind === "practice") {
    redirect("/products");
  }

  if (!deleteWasConfirmed(formData)) {
    redirect(`/clients/${clientId}`);
  }

  await deletePerson(id);
  await recordAudit({
    action: "person.delete",
    summary: `Removed ${person.name} from “${client.name}”.`,
    entityType: "person",
    entityId: id,
    before: person,
    reason: readDeleteReason(formData),
  });
  await revalidateClient(clientId);
  redirect(`/clients/${clientId}`);
}
