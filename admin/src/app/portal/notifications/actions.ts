"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteNotification,
  getNotification,
  setNotificationRead,
} from "@/db/queries";
import { deleteWasConfirmed } from "@/lib/audit";
import { readTrimmed } from "@/lib/forms";
import { isUuid } from "@/lib/ids";
import { requirePortalPerson } from "@/lib/current-person";

function revalidatePortalNotifications() {
  revalidatePath("/notifications");
  revalidatePath("/portal/notifications");
}

export async function markPortalNotificationReadAction(formData: FormData) {
  const { person } = await requirePortalPerson();
  const id = readTrimmed(formData, "id");
  const read = readTrimmed(formData, "read") === "1";
  if (!isUuid(id)) {
    redirect("/notifications");
  }
  const row = await getNotification(id);
  if (
    !row ||
    row.audience !== "portal" ||
    row.personId !== person.id
  ) {
    redirect("/notifications");
  }
  await setNotificationRead(id, read);
  revalidatePortalNotifications();
  redirect("/notifications");
}

export async function deletePortalNotificationAction(formData: FormData) {
  const { person } = await requirePortalPerson();
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
    row.audience !== "portal" ||
    row.personId !== person.id
  ) {
    redirect("/notifications");
  }
  await deleteNotification(id);
  revalidatePortalNotifications();
  redirect("/notifications");
}
