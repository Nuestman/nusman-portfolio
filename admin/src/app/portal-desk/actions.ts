"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addPortalMessage,
  createNotification,
  getClient,
  getPerson,
  getProject,
  setPersonPortalEnabled,
  setProjectPortalIntakeOpen,
} from "@/db/queries";
import { recordAudit } from "@/lib/audit";
import { requireSessionUser } from "@/lib/current-user";
import { readTrimmed } from "@/lib/forms";
import { isUuid } from "@/lib/ids";
import { readMessageBodyFromForm } from "@/lib/message-body";
import { notifyClientsOfPortalMessage } from "@/lib/notify";
import { issuePortalMagicLink } from "@/lib/portal-magic";
import {
  sendPortalAccessGrantedEmail,
  sendPortalMagicLinkEmail,
} from "@/lib/portal-email";

export type PortalDeskState = {
  error: string | null;
  link: string | null;
  emailed: boolean;
};

function revalidatePersonPaths(clientId: string, personId: string) {
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/people/${personId}/edit`);
}

function revalidateProjectPaths(projectId: string, clientId: string) {
  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/messages`);
  revalidatePath(`/messages/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}`);
  revalidatePath(`/portal/projects/${projectId}/intake`);
  revalidatePath(`/portal/projects/${projectId}/brief`);
  revalidatePath(`/portal/projects/${projectId}/messages`);
}

export async function setPersonPortalEnabledAction(
  _previous: PortalDeskState,
  formData: FormData,
): Promise<PortalDeskState> {
  await requireSessionUser();
  const personId = readTrimmed(formData, "personId");
  const clientId = readTrimmed(formData, "clientId");
  if (!isUuid(personId) || !isUuid(clientId)) {
    return { error: "Person is missing.", link: null, emailed: false };
  }

  const person = await getPerson(personId);
  const client = await getClient(clientId);
  if (
    !person ||
    !client ||
    person.clientId !== clientId ||
    client.kind === "practice"
  ) {
    return { error: "That person is gone.", link: null, emailed: false };
  }

  const enabled = formData.get("portalEnabled") === "on";
  if (enabled && !person.email) {
    return {
      error: "Add an email before enabling portal access.",
      link: null,
      emailed: false,
    };
  }

  await setPersonPortalEnabled(personId, enabled);

  let link: string | null = null;
  let emailed = false;
  let mailError: string | null = null;

  if (enabled && person.email && !person.portalEnabled) {
    const issued = await issuePortalMagicLink(personId);
    link = issued?.url ?? null;
    await createNotification({
      audience: "portal",
      kind: "portal_access",
      title: "Portal access is ready",
      body: `You can sign in for ${client.name} and follow progress, schedule, and messages.`,
      href: "/login",
      personId,
      clientId: client.id,
    }).catch((error) => {
      console.error("Portal access in-app notify failed", error);
    });
    const mailed = await sendPortalAccessGrantedEmail({
      to: person.email,
      name: person.name,
      clientName: client.name,
      magicUrl: link,
    });
    emailed = mailed.sent;
    if (!mailed.sent) {
      mailError = mailed.configured
        ? (mailed.error ?? "Could not send the welcome email.")
        : "Email is not configured (RESEND_API_KEY / FROM address).";
    }
  }

  await recordAudit({
    action: enabled ? "portal.enable" : "portal.disable",
    summary: enabled
      ? emailed
        ? `Enabled portal for ${person.name} and emailed access.`
        : `Enabled portal for ${person.name}.`
      : `Disabled portal for ${person.name}.`,
    entityType: "person",
    entityId: personId,
    before: { portalEnabled: person.portalEnabled },
    after: { portalEnabled: enabled, emailed },
  });
  revalidatePersonPaths(clientId, personId);
  return { error: mailError, link, emailed };
}

export async function invitePortalPersonAction(
  _previous: PortalDeskState,
  formData: FormData,
): Promise<PortalDeskState> {
  await requireSessionUser();
  const personId = readTrimmed(formData, "personId");
  const clientId = readTrimmed(formData, "clientId");
  if (!isUuid(personId) || !isUuid(clientId)) {
    return { error: "Person is missing.", link: null, emailed: false };
  }

  const person = await getPerson(personId);
  const client = await getClient(clientId);
  if (
    !person ||
    !client ||
    person.clientId !== clientId ||
    client.kind === "practice"
  ) {
    return { error: "That person is gone.", link: null, emailed: false };
  }
  if (!person.portalEnabled) {
    return {
      error: "Enable portal access first.",
      link: null,
      emailed: false,
    };
  }
  if (!person.email) {
    return {
      error: "This person needs an email for magic links.",
      link: null,
      emailed: false,
    };
  }

  const issued = await issuePortalMagicLink(personId);
  if (!issued) {
    return {
      error: "Could not create a magic link.",
      link: null,
      emailed: false,
    };
  }

  const mailed = await sendPortalMagicLinkEmail({
    to: person.email,
    name: person.name,
    url: issued.url,
  });

  await recordAudit({
    action: "portal.invite",
    summary: mailed.sent
      ? `Emailed portal magic link to ${person.name}.`
      : `Created portal magic link for ${person.name} (copy to send).`,
    entityType: "person",
    entityId: personId,
    after: { emailed: mailed.sent, expiresAt: issued.expiresAt.toISOString() },
  });
  revalidatePersonPaths(clientId, personId);
  return {
    error: mailed.sent
      ? null
      : mailed.configured
        ? `Link ready, but email failed: ${mailed.error ?? "unknown error"}`
        : "Link ready. Email is not configured (RESEND_API_KEY / FROM address) — copy the link.",
    link: issued.url,
    emailed: mailed.sent,
  };
}

export async function setPortalIntakeOpenAction(formData: FormData) {
  await requireSessionUser();
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(projectId)) {
    redirect("/projects");
  }

  const project = await getProject(projectId);
  if (!project || project.workKind !== "client") {
    redirect("/projects");
  }

  const open = formData.get("portalIntakeOpen") === "on";
  await setProjectPortalIntakeOpen(projectId, open);
  await recordAudit({
    action: open ? "portal.discovery-open" : "portal.discovery-close",
    summary: open
      ? `Opened portal discovery form on “${project.title}”.`
      : `Closed portal discovery form on “${project.title}”.`,
    entityType: "project",
    entityId: projectId,
    projectId,
    before: { portalIntakeOpen: project.portalIntakeOpen },
    after: { portalIntakeOpen: open },
  });
  revalidateProjectPaths(projectId, project.clientId);
  redirect(`/projects/${projectId}`);
}

export async function replyPortalMessageAction(
  _previous: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  await requireSessionUser();
  const projectId = readTrimmed(formData, "projectId");
  if (!isUuid(projectId)) {
    return { error: "Project is missing." };
  }

  const project = await getProject(projectId);
  if (!project || project.workKind !== "client") {
    return { error: "That project is gone." };
  }

  const { body } = readMessageBodyFromForm(formData);
  if (!body) {
    return { error: "Write a reply first." };
  }

  await addPortalMessage({
    projectId,
    personId: null,
    authorKind: "operator",
    body,
  });
  await recordAudit({
    action: "portal.message",
    summary: `Replied on portal messages for “${project.title}”.`,
    entityType: "portal_message",
    projectId,
    after: { body, authorKind: "operator" },
  });
  await notifyClientsOfPortalMessage({
    clientId: project.clientId,
    projectId,
    projectTitle: project.title,
    body,
  });
  revalidateProjectPaths(projectId, project.clientId);
  redirect(`/messages/${projectId}`);
}
