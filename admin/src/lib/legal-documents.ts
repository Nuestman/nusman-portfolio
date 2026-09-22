export const LEGAL_SLUGS = ["privacy", "terms"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
};

export type LegalDocumentPayload = {
  slug: LegalSlug;
  title: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

export function isLegalSlug(value: string): value is LegalSlug {
  return (LEGAL_SLUGS as readonly string[]).includes(value);
}

export function parseLegalSections(value: unknown): LegalSection[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const sections: LegalSection[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") {
      return null;
    }
    const row = item as Record<string, unknown>;
    if (typeof row.id !== "string" || typeof row.title !== "string") {
      return null;
    }
    if (!Array.isArray(row.paragraphs)) {
      return null;
    }
    const paragraphs: string[] = [];
    for (const para of row.paragraphs) {
      if (typeof para !== "string") {
        return null;
      }
      paragraphs.push(para);
    }
    sections.push({
      id: row.id,
      title: row.title,
      paragraphs,
    });
  }
  return sections;
}

/** Blank-line separated paragraphs from a textarea. */
export function paragraphsFromTextarea(raw: string): string[] {
  return raw
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => block.trim().replace(/\n+/g, " "))
    .filter(Boolean);
}

export function paragraphsToTextarea(paragraphs: string[]): string {
  return paragraphs.join("\n\n");
}

/** Section id from title: "9. Cookies..." → "cookies" or fallback slug. */
export function sectionIdFromTitle(title: string, fallback: string): string {
  const withoutNumber = title.replace(/^\d+\.\s*/, "").trim();
  const slug = withoutNumber
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug || fallback;
}
