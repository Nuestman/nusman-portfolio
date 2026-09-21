"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  createDeskNotificationsForActiveUsers,
  createNotification,
  createPortalNotificationsForPeople,
  deleteNotification,
  getNotification,
  getPerson,
  listPortalEnabledPeople,
  setNotificationRead,
  updateNotification,
} from "@/db/queries";
import { deleteWasConfirmed, recordAudit } from "@/lib/audit";
import { readOptional, readTrimmed } from "@/lib/forms";
import { isUuid } from "@/lib/ids";
import { requireSessionUser } from "@/lib/current-user";
import { personCanUsePortal } from "@/lib/person-email-verify";

export type FormState = { error: string | null };

function revalidateNotifications() {
  revalidatePath("/notifications");
  revalidatePath("/portal/notifications");
}

export async function createDeskNotificationAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireSessionUser();
  const title = readTrimmed(formData, "title");
  const body = readTrimmed(formData, "body");
  const href = readOptional(formData, "href");
  const target = readTrimmed(formData, "target");
  const personId = readTrimmed(formData, "personId");
  const clientId = readTrimmed(formData, "clientId");

  if (!title || !body) {
    return { error: "Title and body are required." };
  }

  if (target === "desk") {
    await createDeskNotificationsForActiveUsers({
      kind: "manual",
      title,
      body,
      href,
      createdByUserId: user.id,
    });
    await recordAudit({
      action: "notification.create",
      summary: `Created desk notice “${title}”.`,
      entityType: "notification",
      after: { audience: "desk", title },
    });
  } else if (target === "person") {
    if (!isUuid(personId)) {
      return { error: "Pick a portal person." };
    }
    const person = await getPerson(personId);
    if (!person || !personCanUsePortal(person)) {
      return { error: "That person does not have portal access." };
    }
    await createNotification({
      audience: "portal",
      kind: "manual",
      title,
      body,
      href,
      personId,
      clientId: person.clientId,
      createdByUserId: user.id,
    });
    await recordAudit({
      action: "notification.create",
      summary: `Sent portal notice “${title}” to ${person.name}.`,
      entityType: "notification",
      after: { audience: "portal", personId, title },
    });
  } else if (target === "client") {
    if (!isUuid(clientId)) {
      return { error: "Pick a client." };
    }
    const people = await listPortalEnabledPeople(clientId);
    if (people.length === 0) {
      return { error: "That client has no portal-enabled people." };
    }
    await createPortalNotificationsForPeople(
      people.map((person) => person.id),
      {
        kind: "manual",
        title,
        body,
        href,
        clientId,
        createdByUserId: user.id,
      },
    );
    await recordAudit({
      action: "notification.create",
      summary: `Sent portal notice “${title}” to ${people.length} people.`,
      entityType: "notification",
      after: { audience: "portal", clientId, title },
    });
  } else {
    return { error: "Choose who should receive this notice." };
  }

  revalidateNotifications();
  redirect("/notifications");
}

export async function updateDeskNotificationAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const title = readTrimmed(formData, "title");
  const body = readTrimmed(formData, "body");
  const href = readOptional(formData, "href");
  if (!isUuid(id) || !title || !body) {
    return { error: "Title and body are required." };
  }

  const row = await getNotification(id);
  if (
    !row ||
    row.audience !== "desk" ||
    (row.userId && row.userId !== user.id) ||
    row.createdByUserId !== user.id
  ) {
    return { error: "Only the sender can edit this notice." };
  }

  await updateNotification(id, { title, body, href });
  await recordAudit({
    action: "notification.update",
    summary: `Updated notice “${title}”.`,
    entityType: "notification",
    entityId: id,
    before: { title: row.title, body: row.body, href: row.href },
    after: { title, body, href },
  });
  revalidateNotifications();
  redirect("/notifications");
}

export async function markDeskNotificationReadAction(formData: FormData) {
  const user = await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const read = readTrimmed(formData, "read") === "1";
  if (!isUuid(id)) {
    redirect("/notifications");
  }
  const row = await getNotification(id);
  if (
    !row ||
    row.audience !== "desk" ||
    (row.userId && row.userId !== user.id)
  ) {
    redirect("/notifications");
  }
  await setNotificationRead(id, read);
  revalidateNotifications();
  redirect("/notifications");
}

export async function deleteDeskNotificationAction(formData: FormData) {
  const user = await requireSessionUser();
  if (!deleteWasConfirmed(formData)) {
    redirect("/notifications");
  }
  const id = readTrimmed(formData, "id");
  if (!isUuid(id)) {
    redirect("/notifications");
  }
  const row = await getNotification(id);
  if (
    !row ||
    row.audience !== "desk" ||
    (row.userId && row.userId !== user.id)
  ) {
    redirect("/notifications");
  }
  await deleteNotification(id);
  await recordAudit({
    action: "notification.delete",
    summary: `Deleted notice “${row.title}”.`,
    entityType: "notification",
    entityId: id,
    before: row,
  });
  revalidateNotifications();
  redirect("/notifications");
}
