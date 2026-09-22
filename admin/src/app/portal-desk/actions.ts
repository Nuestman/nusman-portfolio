"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addPortalMessage,
  createNotification,
  getClient,
  getPerson,
  getProject,
  markPersonEmailVerified,
  markPeopleEmailVerifiedByEmail,
  setPersonPortalEnabled,
  setProjectPortalIntakeOpen,
} from "@/db/queries";
import { recordAudit } from "@/lib/audit";
import { requireSessionUser } from "@/lib/current-user";
import { readTrimmed } from "@/lib/forms";
import { isUuid } from "@/lib/ids";
import { readMessageBodyFromForm } from "@/lib/message-body";
import {
  formHasAttachments,
  persistMessageAttachments,
} from "@/lib/message-attachments";
import { notifyClientsOfPortalMessage } from "@/lib/notify";
import { issuePortalMagicLink } from "@/lib/portal-magic";
import { isPersonEmailVerified, issuePersonEmailVerify } from "@/lib/person-email-verify";
import { safeInternalPath } from "@/lib/paths";
import {
  sendPortalAccessGrantedEmail,
  sendPortalMagicLinkEmail,
  sendPersonEmailConfirmedEmail,
  sendPersonEmailVerifyEmail,
} from "@/lib/portal-email";

export type PortalDeskState = {
  error: string | null;
  link: string | null;
  emailed: boolean;
};

function revalidatePersonPaths(clientId: string, personId: string) {
  revalidatePath(`/clients/${clientId}`);
  revalidatePath(`/clients/${clientId}/people/${personId}`);
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
  if (enabled && !isPersonEmailVerified(person)) {
    return {
      error:
        "Confirm this email first. Use Confirm email or Resend confirmation below.",
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
  if (!isPersonEmailVerified(person)) {
    return {
      error:
        "Confirm this email first. Use Confirm email or Resend confirmation above.",
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

function redirectPersonNotice(path: string, notice: string): never {
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

export async function confirmPersonEmailAction(formData: FormData) {
  await requireSessionUser();
  const personId = readTrimmed(formData, "personId");
  const clientId = readTrimmed(formData, "clientId");
  const next =
    readTrimmed(formData, "next") || `/clients/${clientId}/people/${personId}`;
  if (!isUuid(personId) || !isUuid(clientId)) {
    redirect("/clients");
  }

  const person = await getPerson(personId);
  const client = await getClient(clientId);
  if (
    !person ||
    !client ||
    person.clientId !== clientId ||
    client.kind === "practice"
  ) {
    redirect("/clients");
  }
  if (!person.email) {
    redirectPersonNotice(next, "person-email-missing");
  }
  if (isPersonEmailVerified(person)) {
    redirectPersonNotice(next, "person-email-already");
  }

  await markPersonEmailVerified(personId);
  await markPeopleEmailVerifiedByEmail(person.email);

  const mailed = await sendPersonEmailConfirmedEmail({
    to: person.email,
    name: person.name,
  });
  await recordAudit({
    action: "person.email-confirm",
    summary: mailed.sent
      ? `Confirmed email for ${person.name} (${person.email}) and sent a notice.`
      : `Confirmed email for ${person.name} (${person.email}); notice did not send.`,
    entityType: "person",
    entityId: personId,
    before: { emailVerifiedAt: person.emailVerifiedAt },
    after: { emailVerifiedAt: new Date().toISOString(), emailed: mailed.sent },
  });
  revalidatePersonPaths(clientId, personId);
  redirectPersonNotice(
    next,
    mailed.sent ? "person-email-confirmed" : "person-email-confirmed-unsent",
  );
}

export async function resendPersonEmailAction(formData: FormData) {
  await requireSessionUser();
  const personId = readTrimmed(formData, "personId");
  const clientId = readTrimmed(formData, "clientId");
  const next =
    readTrimmed(formData, "next") || `/clients/${clientId}/people/${personId}`;
  if (!isUuid(personId) || !isUuid(clientId)) {
    redirect("/clients");
  }

  const person = await getPerson(personId);
  const client = await getClient(clientId);
  if (
    !person ||
    !client ||
    person.clientId !== clientId ||
    client.kind === "practice"
  ) {
    redirect("/clients");
  }
  if (isPersonEmailVerified(person)) {
    redirectPersonNotice(next, "person-email-already");
  }

  const issued = await issuePersonEmailVerify(personId);
  if (!issued) {
    redirectPersonNotice(next, "person-email-resend-missing");
  }

  const mailed = await sendPersonEmailVerifyEmail({
    to: issued.email,
    name: issued.name,
    verifyUrl: issued.url,
  });
  await recordAudit({
    action: "person.email-resend",
    summary: mailed.sent
      ? `Resent email confirmation to ${person.name}.`
      : `Created email confirmation link for ${person.name} (email did not send).`,
    entityType: "person",
    entityId: personId,
    after: { emailed: mailed.sent },
  });
  revalidatePersonPaths(clientId, personId);
  if (!mailed.sent) {
    redirectPersonNotice(next, "person-email-resend-failed");
  }
  redirectPersonNotice(next, "person-email-resent");
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
  const hasFiles = formHasAttachments(formData);
  if (!body && !hasFiles) {
    return { error: "Write a reply or attach a file." };
  }

  const messageId = await addPortalMessage({
    projectId,
    personId: null,
    authorKind: "operator",
    body: body || "(attachment)",
  });
  const attached = await persistMessageAttachments({
    formData,
    clientId: project.clientId,
    projectId,
    messageId,
  });
  if (!attached.ok) {
    return { error: attached.error };
  }
  await recordAudit({
    action: "portal.message",
    summary: `Replied on portal messages for “${project.title}”.`,
    entityType: "portal_message",
    projectId,
    after: { body, authorKind: "operator", messageId, hasAttachments: hasFiles },
  });
  await notifyClientsOfPortalMessage({
    clientId: project.clientId,
    projectId,
    projectTitle: project.title,
    body: body || "(attachment)",
  });
  revalidateProjectPaths(projectId, project.clientId);
  redirect(`/messages/${projectId}`);
}
