import type { NextRequest } from "next/server";
import { getLegalDocument } from "@/db/queries";
import {
  isLegalSlug,
  parseLegalSections,
} from "@/lib/legal-documents";
import {
  publicGetJson,
  publicGetOptions,
} from "@/lib/inbound-http";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export function OPTIONS(request: NextRequest) {
  return publicGetOptions(request);
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params;
  if (!isLegalSlug(slug)) {
    return publicGetJson(request, { ok: false, error: "Not found." }, 404);
  }

  const row = await getLegalDocument(slug);
  if (!row) {
    return publicGetJson(request, { ok: false, error: "Not found." }, 404);
  }

  const sections = parseLegalSections(row.sections);
  if (!sections) {
    return publicGetJson(
      request,
      { ok: false, error: "Document is invalid." },
      500,
    );
  }

  return publicGetJson(request, {
    ok: true,
    slug: row.slug,
    title: row.title,
    lastUpdated: row.lastUpdated,
    intro: row.intro,
    sections,
  });
}
