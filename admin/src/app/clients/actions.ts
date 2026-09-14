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
  updateClient,
  updatePerson,
} from "@/db/queries";
import { readOptional, readTrimmed, looksLikeEmail } from "@/lib/forms";
import { isUuid } from "@/lib/ids";
import { isClientSource, isPersonRole } from "@/lib/labels";
import type { ClientSource, PersonRole } from "@/db/schema";

export type FormState = {
  error: string | null;
};

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
  const parsed = parseClientFields(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const id = await createClient(parsed.values);
  revalidatePath("/clients");
  revalidatePath("/");
  redirect(`/clients/${id}`);
}

export async function updateClientAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
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

  await updateClient(id, parsed.values);
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  revalidatePath("/");
  redirect(`/clients/${id}`);
}

export async function deleteClientAction(formData: FormData) {
  const id = readTrimmed(formData, "id");
  if (!isUuid(id)) {
    redirect("/clients");
  }

  const projectCount = await countProjectsForClient(id);
  if (projectCount > 0) {
    redirect(`/clients/${id}?notice=has-projects`);
  }

  await deleteClient(id);
  revalidatePath("/clients");
  revalidatePath("/");
  redirect("/clients");
}

export async function createPersonAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const clientId = readTrimmed(formData, "clientId");
  if (!isUuid(clientId)) {
    return { error: "Client is missing." };
  }

  const client = await getClient(clientId);
  if (!client) {
    return { error: "That client is gone." };
  }

  const parsed = parsePersonFields(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  await createPerson({ clientId, ...parsed.values });
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function updatePersonAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
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

  await updatePerson(id, parsed.values);
  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}

export async function deletePersonAction(formData: FormData) {
  const id = readTrimmed(formData, "id");
  const clientId = readTrimmed(formData, "clientId");
  if (!isUuid(id) || !isUuid(clientId)) {
    redirect("/clients");
  }

  const person = await getPerson(id);
  if (person && person.clientId === clientId) {
    await deletePerson(id);
  }

  revalidatePath(`/clients/${clientId}`);
  redirect(`/clients/${clientId}`);
}
