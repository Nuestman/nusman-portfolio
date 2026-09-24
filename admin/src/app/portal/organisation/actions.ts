"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createDeskNotificationsForActiveUsers,
  createPerson,
  findClientPersonByEmail,
  updateClientContact,
} from "@/db/queries";
import { recordAuditSafe } from "@/lib/audit";
import { requirePortalPerson } from "@/lib/current-person";
import { readOptional, readTrimmed } from "@/lib/forms";
import { isPersonRole } from "@/lib/labels";

export type PortalOrganisationFormState = { error: string | null };

function revalidateOrganisation(clientId: string) {
  revalidatePath("/organisation");
  revalidatePath("/profile");
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/portal/organisation");
  revalidatePath("/portal/profile");
}

export async function savePortalOrganisationAction(
  _previous: PortalOrganisationFormState,
  formData: FormData,
): Promise<PortalOrganisationFormState> {
  const { person, client } = await requirePortalPerson();

  const name = readTrimmed(formData, "name");
  if (!name) {
    return { error: "Hiring party name is required." };
  }
  if (name.length > 200) {
    return { error: "Hiring party name is too long." };
  }

  const organisation = readOptional(formData, "organisation");
  const emailRaw = readOptional(formData, "email");
  const phone = readOptional(formData, "phone");

  if (organisation && organisation.length > 200) {
    return { error: "Organisation name is too long." };
  }
  if (emailRaw && (emailRaw.length > 320 || !emailRaw.includes("@"))) {
    return { error: "Enter a valid email, or leave it blank." };
  }
  if (phone && phone.length > 40) {
    return { error: "Phone is too long." };
  }

  const next = {
    name,
    organisation,
    email: emailRaw ? emailRaw.toLowerCase() : null,
    phone,
  };
  await updateClientContact(client.id, next);
  await recordAuditSafe({
    action: "portal.organisation-save",
    summary: `${person.name} updated hiring party “${name}”.`,
    entityType: "client",
    entityId: client.id,
    actorEmail: person.email,
    before: {
      name: client.name,
      organisation: client.organisation,
      email: client.email,
      phone: client.phone,
    },
    after: next,
  });

  revalidateOrganisation(client.id);
  redirect("/organisation?notice=saved");
}

export async function requestPortalPersonAction(
  _previous: PortalOrganisationFormState,
  formData: FormData,
): Promise<PortalOrganisationFormState> {
  const { person, client } = await requirePortalPerson();

  const name = readTrimmed(formData, "name");
  if (!name) {
    return { error: "Name is required." };
  }
  if (name.length > 200) {
    return { error: "Name is too long." };
  }

  const roleRaw = readTrimmed(formData, "role");
  if (!isPersonRole(roleRaw)) {
    return { error: "Choose a role." };
  }

  const emailRaw = readTrimmed(formData, "email");
  const phone = readOptional(formData, "phone");
  if (!emailRaw) {
    return { error: "Email is required so Usman can confirm and enable Portal." };
  }
  if (emailRaw.length > 320 || !emailRaw.includes("@")) {
    return { error: "Enter a valid email." };
  }
  if (phone && phone.length > 40) {
    return { error: "Phone is too long." };
  }

  const email = emailRaw.toLowerCase();

  const existing = await findClientPersonByEmail(email);
  if (existing) {
    if (existing.person.clientId === client.id) {
      return { error: "That email is already on this organisation." };
    }
    return { error: "That email is already used on another account." };
  }

  const isDecisionMaker = formData.get("isDecisionMaker") === "on";
  const notes = [
    `Requested from Portal by ${person.name}${person.email ? ` <${person.email}>` : ""}.`,
    "Waiting for Usman to confirm email and enable Portal access.",
  ].join("\n");

  const personId = await createPerson({
    clientId: client.id,
    name,
    email,
    phone,
    role: roleRaw,
    isDecisionMaker,
    notes,
    portalRequestedAt: new Date(),
  });

  await recordAuditSafe({
    action: "portal.person-request",
    summary: `${person.name} requested person “${name}” on “${client.name}”.`,
    entityType: "person",
    entityId: personId,
    actorEmail: person.email,
    after: {
      clientId: client.id,
      name,
      email,
      phone,
      role: roleRaw,
      isDecisionMaker,
    },
  });

  await createDeskNotificationsForActiveUsers({
    kind: "system",
    title: `Portal person request: ${name}`,
    body: `${person.name} (${client.name}) asked to add ${name} <${email}>. Confirm email and enable Portal when ready.`,
    href: `/clients/${client.id}/people/${personId}`,
    clientId: client.id,
  }).catch((error) => {
    console.error("Portal person request notify failed", error);
  });

  revalidateOrganisation(client.id);
  revalidatePath(`/clients/${client.id}/people/${personId}`);
  redirect("/organisation?notice=person-requested");
}
