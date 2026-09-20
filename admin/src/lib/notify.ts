import {
  createDeskNotificationsForActiveUsers,
  createPortalNotificationsForPeople,
  listPortalEnabledPeople,
  listPortalNotifyPeople,
} from "@/db/queries";
import { mailIsConfigured, type SendEmailResult } from "@/lib/mail";
import {
  deskNotifyRecipients,
  deskPublicBaseUrl,
  portalPublicBaseUrl,
  sendMilestoneNotifyEmail,
  sendPortalMessageNotifyEmail,
  sendScheduleNotifyEmail,
  sendStageNotifyEmail,
} from "@/lib/notify-email";
import type { NotificationKind } from "@/db/schema";
import { messageBodyPlainText } from "@/lib/message-body";

/** Never throw — alerts must not block the primary action. */
async function safe(run: () => Promise<unknown>) {
  try {
    await run();
  } catch (error) {
    console.error("Notify failed", error);
  }
}

function logSendResults(kind: string, results: SendEmailResult[]) {
  for (const result of results) {
    if (result.sent) {
      continue;
    }
    if (!result.configured) {
      console.warn(`Notify skipped (${kind}): mail not configured`);
      return;
    }
    console.error(
      `Notify failed (${kind}):`,
      result.error ?? "Resend did not accept the message",
    );
  }
}

async function recordPortalInApp(
  clientId: string,
  values: {
    kind: NotificationKind;
    title: string;
    body: string;
    href?: string | null;
    projectId?: string | null;
  },
) {
  await safe(async () => {
    const people = await listPortalEnabledPeople(clientId);
    await createPortalNotificationsForPeople(
      people.map((person) => person.id),
      {
        kind: values.kind,
        title: values.title,
        body: values.body,
        href: values.href ?? null,
        clientId,
        projectId: values.projectId ?? null,
      },
    );
  });
}

async function recordDeskInApp(values: {
  kind: NotificationKind;
  title: string;
  body: string;
  href?: string | null;
  projectId?: string | null;
  clientId?: string | null;
}) {
  await safe(async () => {
    await createDeskNotificationsForActiveUsers({
      kind: values.kind,
      title: values.title,
      body: values.body,
      href: values.href ?? null,
      projectId: values.projectId ?? null,
      clientId: values.clientId ?? null,
    });
  });
}

async function withPortalRecipients(
  kind: string,
  clientId: string,
  sendOne: (person: {
    email: string;
    name: string;
  }) => Promise<SendEmailResult>,
) {
  await safe(async () => {
    if (!mailIsConfigured()) {
      console.warn(`Notify skipped (${kind}): mail not configured`);
      return;
    }
    const people = await listPortalNotifyPeople(clientId);
    if (people.length === 0) {
      console.warn(
        `Notify skipped (${kind}): no portal-enabled people with email for client ${clientId}`,
      );
      return;
    }
    const results = await Promise.all(
      people.map((person) =>
        sendOne({ email: person.email, name: person.name }),
      ),
    );
    logSendResults(kind, results);
  });
}

export async function notifyClientsOfPortalMessage(input: {
  clientId: string;
  projectId: string;
  projectTitle: string;
  body: string;
}) {
  const threadPath = `/messages/${input.projectId}`;
  const preview = messageBodyPlainText(input.body).slice(0, 280);
  await recordPortalInApp(input.clientId, {
    kind: "message",
    title: `New message on ${input.projectTitle}`,
    body: preview || "Usman sent a message.",
    href: threadPath,
    projectId: input.projectId,
  });
  const threadUrl = `${portalPublicBaseUrl()}${threadPath}`;
  await withPortalRecipients("portal-message", input.clientId, (person) =>
    sendPortalMessageNotifyEmail({
      to: person.email,
      recipientName: person.name,
      projectTitle: input.projectTitle,
      authorLabel: "Usman",
      body: preview || input.body,
      threadUrl,
    }),
  );
}

export async function notifyDeskOfPortalMessage(input: {
  projectId: string;
  projectTitle: string;
  authorName: string;
  body: string;
}) {
  const threadPath = `/messages/${input.projectId}`;
  const preview = messageBodyPlainText(input.body).slice(0, 280);
  await recordDeskInApp({
    kind: "message",
    title: `Portal message: ${input.projectTitle}`,
    body: `${input.authorName}: ${preview || "(empty message)"}`,
    href: threadPath,
    projectId: input.projectId,
  });
  await safe(async () => {
    const to = deskNotifyRecipients();
    if (to.length === 0) {
      console.warn("Notify skipped (desk-portal-message): no desk recipients");
      return;
    }
    const result = await sendPortalMessageNotifyEmail({
      to,
      projectTitle: input.projectTitle,
      authorLabel: input.authorName,
      body: preview || input.body,
      threadUrl: `${deskPublicBaseUrl()}${threadPath}`,
      forDesk: true,
    });
    logSendResults("desk-portal-message", [result]);
  });
}

export async function notifyClientsOfSchedule(input: {
  clientId: string;
  projectId: string;
  projectTitle: string;
  headline: string;
  details: string[];
}) {
  const schedulePath = `/projects/${input.projectId}/schedule`;
  await recordPortalInApp(input.clientId, {
    kind: "schedule",
    title: input.headline,
    body: [input.projectTitle, ...input.details].filter(Boolean).join(" · "),
    href: schedulePath,
    projectId: input.projectId,
  });
  const actionUrl = `${portalPublicBaseUrl()}${schedulePath}`;
  await withPortalRecipients("schedule", input.clientId, (person) =>
    sendScheduleNotifyEmail({
      to: person.email,
      recipientName: person.name,
      projectTitle: input.projectTitle,
      headline: input.headline,
      details: input.details,
      actionUrl,
    }),
  );
}

export async function notifyDeskOfSchedule(input: {
  projectId: string;
  projectTitle: string;
  headline: string;
  details: string[];
}) {
  const projectPath = `/projects/${input.projectId}`;
  await recordDeskInApp({
    kind: "schedule",
    title: input.headline,
    body: [input.projectTitle, ...input.details].filter(Boolean).join(" · "),
    href: projectPath,
    projectId: input.projectId,
  });
  await safe(async () => {
    const to = deskNotifyRecipients();
    if (to.length === 0) {
      console.warn("Notify skipped (desk-schedule): no desk recipients");
      return;
    }
    const result = await sendScheduleNotifyEmail({
      to,
      projectTitle: input.projectTitle,
      headline: input.headline,
      details: input.details,
      actionUrl: `${deskPublicBaseUrl()}${projectPath}`,
      forDesk: true,
    });
    logSendResults("desk-schedule", [result]);
  });
}

export async function notifyClientsOfMilestone(input: {
  clientId: string;
  projectId: string;
  projectTitle: string;
  milestoneLabel: string;
  done: boolean;
}) {
  const projectPath = `/projects/${input.projectId}`;
  await recordPortalInApp(input.clientId, {
    kind: "milestone",
    title: input.done
      ? `Milestone done: ${input.milestoneLabel}`
      : `Milestone reopened: ${input.milestoneLabel}`,
    body: `On “${input.projectTitle}”.`,
    href: projectPath,
    projectId: input.projectId,
  });
  const projectUrl = `${portalPublicBaseUrl()}${projectPath}`;
  await withPortalRecipients("milestone", input.clientId, (person) =>
    sendMilestoneNotifyEmail({
      to: person.email,
      recipientName: person.name,
      projectTitle: input.projectTitle,
      milestoneLabel: input.milestoneLabel,
      done: input.done,
      projectUrl,
    }),
  );
}

export async function notifyClientsOfStage(input: {
  clientId: string;
  projectId: string;
  projectTitle: string;
  fromLabel: string;
  toLabel: string;
}) {
  const projectPath = `/projects/${input.projectId}`;
  await recordPortalInApp(input.clientId, {
    kind: "stage",
    title: `Stage update: ${input.projectTitle}`,
    body: `${input.fromLabel} → ${input.toLabel}`,
    href: projectPath,
    projectId: input.projectId,
  });
  const projectUrl = `${portalPublicBaseUrl()}${projectPath}`;
  await withPortalRecipients("stage", input.clientId, (person) =>
    sendStageNotifyEmail({
      to: person.email,
      recipientName: person.name,
      projectTitle: input.projectTitle,
      fromLabel: input.fromLabel,
      toLabel: input.toLabel,
      projectUrl,
    }),
  );
}
