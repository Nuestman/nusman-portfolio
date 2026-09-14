import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getOption, getProject } from "@/db/queries";
import { DeskHeader } from "@/components/desk-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isUuid } from "@/lib/ids";
import { optionKindLabel } from "@/lib/labels";
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
    <div className="min-h-full">
      <DeskHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div>
          <Link
            href={`/projects/${id}`}
            className="text-sm text-dark-950 hover:text-gold-500"
          >
            ← {project.title}
          </Link>
          <h1 className="mt-3 font-heading text-3xl text-dark-950 md:text-4xl">
            Edit {optionKindLabel(option.kind).toLowerCase()} option
          </h1>
        </div>
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
      </main>
    </div>
  );
}
