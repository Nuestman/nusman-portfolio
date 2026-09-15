"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addActivity, deleteActivity, getActivity, updateActivity } from "@/db/queries";
import {
  deleteWasConfirmed,
  readDeleteReason,
  recordAudit,
} from "@/lib/audit";
import { readTrimmed } from "@/lib/forms";
import { isUuid } from "@/lib/ids";
import { requireSessionUser } from "@/lib/current-user";

export type FormState = {
  error: string | null;
};

function logNext(formData: FormData): "/" | "/log" {
  const next = readTrimmed(formData, "next");
  if (next === "/log") {
    return "/log";
  }
  return "/";
}

function revalidateLog() {
  revalidatePath("/");
  revalidatePath("/log");
}

export async function addActivityAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const body = readTrimmed(formData, "body");
  if (!body) {
    return { error: "Write a line first." };
  }

  await addActivity(body);
  await recordAudit({
    action: "log.create",
    summary: "Added a journal line.",
    entityType: "activity",
    after: { body },
  });
  revalidateLog();
  redirect(logNext(formData));
}

export async function updateActivityAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  if (!isUuid(id)) {
    return { error: "That line is missing." };
  }

  const body = readTrimmed(formData, "body");
  if (!body) {
    return { error: "Write a line first." };
  }

  const row = await getActivity(id);
  if (!row) {
    return { error: "That line is gone." };
  }

  await updateActivity(id, body);
  await recordAudit({
    action: "log.update",
    summary: "Updated a journal line.",
    entityType: "activity",
    entityId: id,
    before: row,
    after: { body },
  });
  revalidateLog();
  revalidatePath(`/log/${id}/edit`);
  redirect(logNext(formData));
}

export async function deleteActivityAction(formData: FormData) {
  await requireSessionUser();
  const id = readTrimmed(formData, "id");
  const next = logNext(formData);
  if (!isUuid(id)) {
    redirect(next);
  }

  const row = await getActivity(id);
  if (row) {
    if (!deleteWasConfirmed(formData)) {
      redirect(next);
    }
    await deleteActivity(id);
    await recordAudit({
      action: "log.delete",
      summary: "Removed a journal line.",
      entityType: "activity",
      entityId: id,
      before: row,
      reason: readDeleteReason(formData),
    });
    revalidateLog();
  }

  redirect(next);
}
