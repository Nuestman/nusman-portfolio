import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getDemo, getProject } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isUuid } from "@/lib/ids";
import { linkClassName } from "@/lib/links";
import { DemoForm } from "@/app/projects/demo-form";

export const dynamic = "force-dynamic";

type EditDemoPageProps = {
  params: Promise<{ id: string; demoId: string }>;
};

export default async function EditDemoPage({ params }: EditDemoPageProps) {
  const { id, demoId } = await params;
  if (!isUuid(id) || !isUuid(demoId)) {
    notFound();
  }

  const [project, demo] = await Promise.all([getProject(id), getDemo(demoId)]);
  if (!project || !demo || demo.projectId !== id) {
    notFound();
  }

  const email = await getSessionEmail();

  return (
    <DeskShell email={email} width="3xl">
      <div>
        <Link href={`/projects/${id}`} className={linkClassName("back")}>
          ← {project.title}
        </Link>
        <h1 className="mt-3 section-heading">Edit demo</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Demo</CardTitle>
        </CardHeader>
        <CardContent>
          <DemoForm
            projectId={id}
            isProduct={project.workKind === "product"}
            demo={{
              id: demo.id,
              happenedAt: demo.happenedAt ?? "",
              notes: demo.notes,
            }}
            submitLabel="Save demo"
          />
        </CardContent>
      </Card>
    </DeskShell>
  );
}
