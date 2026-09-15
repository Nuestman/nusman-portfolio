"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addNote,
  createProject,
  getOrCreatePracticeClient,
  recordKnownProducts,
} from "@/db/queries";
import { recordAudit } from "@/lib/audit";
import { readOptional, readTrimmed } from "@/lib/forms";

export type FormState = {
  error: string | null;
};

function revalidateProducts() {
  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath("/projects");
}

export async function createProductAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const title = readTrimmed(formData, "title");
  if (!title) {
    return { error: "Title is required." };
  }

  const practice = await getOrCreatePracticeClient();
  const id = await createProject({
    clientId: practice.id,
    title,
    problemSentence: readOptional(formData, "problemSentence"),
    successLooksLike: readOptional(formData, "successLooksLike"),
    workKind: "product",
    currentGate: "launch",
    status: "active",
  });

  await addNote(id, "Recorded as an own product.");
  await recordAudit({
    action: "product.create",
    summary: `Recorded product “${title}”.`,
    entityType: "project",
    entityId: id,
    projectId: id,
    after: {
      title,
      workKind: "product",
      currentGate: "launch",
      problemSentence: readOptional(formData, "problemSentence"),
      successLooksLike: readOptional(formData, "successLooksLike"),
    },
  });
  revalidateProducts();
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

export async function recordKnownProductsAction(
  _previous: FormState,
  _formData: FormData,
): Promise<FormState> {
  try {
    await recordKnownProducts();
    await recordAudit({
      action: "product.record-known",
      summary: "Recorded known products.",
      entityType: "project",
    });
  } catch (error) {
    console.error("Desk record known products failed", error);
    return { error: "Could not record products." };
  }
  revalidateProducts();
  redirect("/products");
}
