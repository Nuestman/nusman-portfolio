"use server";

import { redirect } from "next/navigation";
import { markPortalOnboardingComplete } from "@/db/queries";
import { recordAuditSafe } from "@/lib/audit";
import { requirePortalPerson } from "@/lib/current-person";
import { portalOnboardingNextPath } from "./next-path";

export async function completePortalOnboardingAction(formData: FormData) {
  const { person } = await requirePortalPerson();
  const next = portalOnboardingNextPath(String(formData.get("next") ?? ""));

  if (!person.portalOnboardingCompletedAt) {
    await markPortalOnboardingComplete(person.id);
    await recordAuditSafe({
      action: "portal.onboarding.complete",
      summary: `${person.name} finished Portal onboarding.`,
      entityType: "person",
      entityId: person.id,
      actorEmail: person.email,
    });
  }

  redirect(next);
}
