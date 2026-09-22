"use server";

import { revalidatePath } from "next/cache";
import { getLegalDocument, updateLegalDocument } from "@/db/queries";
import { recordAudit } from "@/lib/audit";
import { requireSessionUser } from "@/lib/current-user";
import { readTrimmed } from "@/lib/forms";
import {
  isLegalSlug,
  paragraphsFromTextarea,
  sectionIdFromTitle,
  type LegalSection,
} from "@/lib/legal-documents";

export type FormState = { error: string | null };

function revalidateLegal(slug: string) {
  revalidatePath("/legal");
  revalidatePath(`/legal/${slug}/edit`);
  revalidatePath(`/api/legal/${slug}`);
}

function parseSectionsFromForm(formData: FormData): LegalSection[] | null {
  const countRaw = readTrimmed(formData, "sectionCount");
  const count = Number.parseInt(countRaw, 10);
  if (!Number.isFinite(count) || count < 1 || count > 40) {
    return null;
  }

  const sections: LegalSection[] = [];
  for (let i = 0; i < count; i += 1) {
    const title = readTrimmed(formData, `sectionTitle_${i}`);
    const body = String(formData.get(`sectionBody_${i}`) ?? "");
    if (!title) {
      continue;
    }
    const paragraphs = paragraphsFromTextarea(body);
    if (paragraphs.length === 0) {
      return null;
    }
    const existingId = readTrimmed(formData, `sectionId_${i}`);
    sections.push({
      id: existingId || sectionIdFromTitle(title, `section-${i + 1}`),
      title,
      paragraphs,
    });
  }
  return sections.length > 0 ? sections : null;
}

export async function updateLegalDocumentAction(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireSessionUser();
  const slug = readTrimmed(formData, "slug");
  if (!isLegalSlug(slug)) {
    return { error: "Unknown document." };
  }

  const title = readTrimmed(formData, "title");
  const lastUpdated = readTrimmed(formData, "lastUpdated");
  const intro = readTrimmed(formData, "intro");
  if (!title || !lastUpdated || !intro) {
    return { error: "Title, last updated, and intro are required." };
  }

  const sections = parseSectionsFromForm(formData);
  if (!sections) {
    return {
      error:
        "Add at least one section with a title and paragraphs (blank line between paragraphs).",
    };
  }

  const before = await getLegalDocument(slug);
  if (!before) {
    return { error: "Document not found." };
  }

  const updated = await updateLegalDocument(slug, {
    title,
    lastUpdated,
    intro,
    sections,
    updatedByUserId: user.id,
  });
  if (!updated) {
    return { error: "Could not save." };
  }

  await recordAudit({
    action: "legal.update",
    summary: `Updated legal document “${title}” (${slug}).`,
    entityType: "site_legal_document",
    entityId: slug,
    before: {
      title: before.title,
      lastUpdated: before.lastUpdated,
      intro: before.intro,
      sections: before.sections,
    },
    after: {
      title: updated.title,
      lastUpdated: updated.lastUpdated,
      intro: updated.intro,
      sections: updated.sections,
    },
  });

  revalidateLegal(slug);
  return { error: null };
}
