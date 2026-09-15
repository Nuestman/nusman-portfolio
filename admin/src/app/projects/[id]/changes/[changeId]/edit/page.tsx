import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getChangeRequest, getProject } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isUuid } from "@/lib/ids";
import { linkClassName } from "@/lib/links";
import { ChangeForm } from "@/app/projects/change-form";

export const dynamic = "force-dynamic";

type EditChangePageProps = {
  params: Promise<{ id: string; changeId: string }>;
};

export default async function EditChangePage({ params }: EditChangePageProps) {
  const { id, changeId } = await params;
  if (!isUuid(id) || !isUuid(changeId)) {
    notFound();
  }

  const [project, change] = await Promise.all([
    getProject(id),
    getChangeRequest(changeId),
  ]);
  if (!project || !change || change.projectId !== id) {
    notFound();
  }

  const email = await getSessionEmail();

  return (
    <DeskShell email={email} width="3xl">
      <div>
        <Link href={`/projects/${id}`} className={linkClassName("back")}>
          ← {project.title}
        </Link>
        <h1 className="mt-3 section-heading">Edit change request</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Change request</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangeForm
            projectId={id}
            change={{
              id: change.id,
              body: change.body,
              status: change.status,
            }}
            submitLabel="Save change"
          />
        </CardContent>
      </Card>
    </DeskShell>
  );
}
