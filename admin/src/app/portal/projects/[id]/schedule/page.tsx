import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPortalProjectForPerson,
  listPeople,
  listPortalProjectsForClient,
  listProjectEvents,
} from "@/db/queries";
import { PortalShell } from "@/components/portal-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCard } from "@/components/editable-card";
import { requirePortalPerson } from "@/lib/current-person";
import { isUuid } from "@/lib/ids";
import { linkClassName } from "@/lib/links";
import { PortalRequestMeetingForm } from "../../request-meeting-form";
import { PortalScheduleList } from "../../schedule-list";

export const dynamic = "force-dynamic";

type PortalSchedulePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PortalSchedulePage({
  params,
}: PortalSchedulePageProps) {
  const { id } = await params;
  if (!isUuid(id)) {
    notFound();
  }

  const { person, client } = await requirePortalPerson();
  const project = await getPortalProjectForPerson(id, client.id);
  if (!project) {
    notFound();
  }

  const [events, projects, people] = await Promise.all([
    listProjectEvents(project.id),
    listPortalProjectsForClient(client.id),
    listPeople(client.id),
  ]);

  return (
    <PortalShell>
      <div>
        <Link
          href={`/projects/${project.id}`}
          className={linkClassName("back")}
        >
          ← {project.title}
        </Link>
        <h1 className="mt-3 section-heading">Schedule</h1>
        <p className="mt-2 text-gray-700">
          Confirm times Usman proposes, or request a meeting.
        </p>
        <p className="mt-2 text-sm">
          <Link href="/schedule" className={linkClassName("nav")}>
            All schedule
          </Link>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming</CardTitle>
        </CardHeader>
        <CardContent>
          <PortalScheduleList
            events={events.map((event) => ({
              ...event,
              projectId: project.id,
            }))}
          />
        </CardContent>
      </Card>

      <EditableCard
        title="Request a meeting"
        hint="Defaults to you; pick another person on the account if needed."
        editLabel="Request"
        form={
          <PortalRequestMeetingForm
            projects={projects.map((row) => ({
              id: row.id,
              title: row.title,
            }))}
            people={people.map((row) => ({
              id: row.id,
              name: row.name,
              role: row.role,
            }))}
            defaultPersonId={person.id}
            defaultProjectId={project.id}
          />
        }
        view={
          <p className="text-sm text-gray-600">
            Need a call, demo, or meeting? Tap Request.
          </p>
        }
      />
    </PortalShell>
  );
}
