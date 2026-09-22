import { notFound } from "next/navigation";
import { getLegalDocument } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { requireSessionUser } from "@/lib/current-user";
import { isLegalSlug } from "@/lib/legal-documents";
import { LegalEditForm } from "../../legal-edit-form";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditLegalPage({ params }: PageProps) {
  await requireSessionUser();
  const { slug } = await params;
  if (!isLegalSlug(slug)) {
    notFound();
  }
  const row = await getLegalDocument(slug);
  if (!row) {
    notFound();
  }

  return (
    <DeskShell>
      <div className="mb-8">
        <h1 className="section-heading">Edit {row.title}</h1>
        <p className="mt-2 max-w-2xl text-gray-700">
          Plain text only — same shape the public site renders. Contact block
          on the site stays in code (LEGAL_CONTACT).
        </p>
      </div>
      <LegalEditForm
        slug={row.slug}
        title={row.title}
        lastUpdated={row.lastUpdated}
        intro={row.intro}
        sections={row.sections}
      />
    </DeskShell>
  );
}
