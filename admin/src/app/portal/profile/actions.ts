"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updatePersonImageUrl } from "@/db/queries";
import { recordAuditSafe } from "@/lib/audit";
import { uploadPersonAvatar } from "@/lib/blob-storage";
import { requirePortalPerson } from "@/lib/current-person";

export type PortalProfileFormState = { error: string | null };

export async function updatePortalProfilePhotoAction(
  _previous: PortalProfileFormState,
  formData: FormData,
): Promise<PortalProfileFormState> {
  const { person, client } = await requirePortalPerson();
  const photo = await uploadPersonAvatar(
    client.id,
    person.id,
    formData,
    person.imageUrl,
  );
  if (!photo.ok) {
    return { error: photo.error };
  }
  if (!photo.value) {
    return { error: "Choose a photo to upload." };
  }

  await updatePersonImageUrl(person.id, photo.value.imageUrl);
  await recordAuditSafe({
    action: "portal.profile.photo",
    summary: `${person.name} updated their portal photo.`,
    entityType: "person",
    entityId: person.id,
    actorEmail: person.email,
    after: { imageUrl: photo.value.imageUrl },
  });

  revalidatePath("/profile");
  revalidatePath("/portal/profile");
  revalidatePath("/");
  redirect("/profile?notice=photo");
}
