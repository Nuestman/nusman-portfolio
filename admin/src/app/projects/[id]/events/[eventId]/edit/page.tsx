import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getProject, getProjectEvent } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { PageSpread } from "@/components/page-spread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isUuid } from "@/lib/ids";
import { linkClassName } from "@/lib/links";
import { ProjectEventForm } from "@/app/projects/event-form";

export const dynamic = "force-dynamic";

type EditEventPageProps = {
  params: Promise<{ id: string; eventId: string }>;
};

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id, eventId } = await params;
  if (!isUuid(id) || !isUuid(eventId)) {
    notFound();
  }

  const [project, event] = await Promise.all([
    getProject(id),
    getProjectEvent(eventId),
  ]);
  if (!project || !event || event.projectId !== id) {
    notFound();
  }
  if (project.workKind === "product") {
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
            <h1 className="mt-3 section-heading">Edit event</h1>
          </>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectEventForm
              projectId={id}
              event={{
                id: event.id,
                kind: event.kind,
                title: event.title,
                status: event.status,
                startsAt: event.startsAt,
                endsAt: event.endsAt,
                location: event.location,
                notes: event.notes,
              }}
              submitLabel="Save event"
            />
          </CardContent>
        </Card>
      </PageSpread>
    </DeskShell>
  );
}
