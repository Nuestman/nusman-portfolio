import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getOption, getProject } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { PageSpread } from "@/components/page-spread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isUuid } from "@/lib/ids";
import { optionKindLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { OptionForm } from "@/app/projects/option-form";

export const dynamic = "force-dynamic";

type EditOptionPageProps = {
  params: Promise<{ id: string; optionId: string }>;
};

export default async function EditOptionPage({ params }: EditOptionPageProps) {
  const { id, optionId } = await params;
  if (!isUuid(id) || !isUuid(optionId)) {
    notFound();
  }

  const [project, option] = await Promise.all([
    getProject(id),
    getOption(optionId),
  ]);
  if (!project || !option || option.projectId !== id) {
    notFound();
  }

  const email = await getSessionEmail();

  return (
    <DeskShell email={email}>
      <PageSpread
        intro={
          <>
            <Link href={`/projects/${id}`} className={linkClassName("back")}>
              ← {project.title}
            </Link>
            <h1 className="mt-3 section-heading">
              Edit {optionKindLabel(option.kind).toLowerCase()} option
            </h1>
          </>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Option</CardTitle>
          </CardHeader>
          <CardContent>
            <OptionForm
              submitLabel="Save option"
              availableKinds={[option.kind]}
              option={{
                id: option.id,
                projectId: option.projectId,
                kind: option.kind,
                summary: option.summary,
                priceNote: option.priceNote ?? "",
                timelineNote: option.timelineNote ?? "",
                inScope: option.inScope ?? "",
                outOfScope: option.outOfScope ?? "",
              }}
            />
          </CardContent>
        </Card>
      </PageSpread>
    </DeskShell>
  );
}
