import { listPortalNotifyPeople } from "@/db/queries";
import {
  deskNotifyRecipients,
  deskPublicBaseUrl,
  portalPublicBaseUrl,
  sendMilestoneNotifyEmail,
  sendPortalMessageNotifyEmail,
  sendScheduleNotifyEmail,
} from "@/lib/notify-email";

/** Never throw — alerts must not block the primary action. */
async function safe(run: () => Promise<unknown>) {
  try {
    await run();
  } catch (error) {
    console.error("Notify email failed", error);
  }
}

export async function notifyClientsOfPortalMessage(input: {
  clientId: string;
  projectId: string;
  projectTitle: string;
  body: string;
}) {
  await safe(async () => {
    const people = await listPortalNotifyPeople(input.clientId);
    if (people.length === 0) {
      return;
    }
    const threadUrl = `${portalPublicBaseUrl()}/messages/${input.projectId}`;
    await Promise.all(
      people.map((person) =>
        sendPortalMessageNotifyEmail({
          to: person.email,
          recipientName: person.name,
          projectTitle: input.projectTitle,
          authorLabel: "Usman",
          body: input.body,
          threadUrl,
        }),
      ),
    );
  });
}

export async function notifyDeskOfPortalMessage(input: {
  projectId: string;
  projectTitle: string;
  authorName: string;
  body: string;
}) {
  await safe(async () => {
    const to = deskNotifyRecipients();
    if (to.length === 0) {
      return;
    }
    await sendPortalMessageNotifyEmail({
      to,
      projectTitle: input.projectTitle,
      authorLabel: input.authorName,
      body: input.body,
      threadUrl: `${deskPublicBaseUrl()}/messages/${input.projectId}`,
      forDesk: true,
    });
  });
}

export async function notifyClientsOfSchedule(input: {
  clientId: string;
  projectId: string;
  projectTitle: string;
  headline: string;
  details: string[];
}) {
  await safe(async () => {
    const people = await listPortalNotifyPeople(input.clientId);
    if (people.length === 0) {
      return;
    }
    const actionUrl = `${portalPublicBaseUrl()}/projects/${input.projectId}/schedule`;
    await Promise.all(
      people.map((person) =>
        sendScheduleNotifyEmail({
          to: person.email,
          recipientName: person.name,
          projectTitle: input.projectTitle,
          headline: input.headline,
          details: input.details,
          actionUrl,
        }),
      ),
    );
  });
}

export async function notifyDeskOfSchedule(input: {
  projectId: string;
  projectTitle: string;
  headline: string;
  details: string[];
}) {
  await safe(async () => {
    const to = deskNotifyRecipients();
    if (to.length === 0) {
      return;
    }
    await sendScheduleNotifyEmail({
      to,
      projectTitle: input.projectTitle,
      headline: input.headline,
      details: input.details,
      actionUrl: `${deskPublicBaseUrl()}/projects/${input.projectId}`,
      forDesk: true,
    });
  });
}

export async function notifyClientsOfMilestone(input: {
  clientId: string;
  projectId: string;
  projectTitle: string;
  milestoneLabel: string;
  done: boolean;
}) {
  await safe(async () => {
    const people = await listPortalNotifyPeople(input.clientId);
    if (people.length === 0) {
      return;
    }
    const projectUrl = `${portalPublicBaseUrl()}/projects/${input.projectId}`;
    await Promise.all(
      people.map((person) =>
        sendMilestoneNotifyEmail({
          to: person.email,
          recipientName: person.name,
          projectTitle: input.projectTitle,
          milestoneLabel: input.milestoneLabel,
          done: input.done,
          projectUrl,
        }),
      ),
    );
  });
}
