import type { Metadata } from "next";
import {
  listPeople,
  listPortalProjectsForClient,
  listPortalScheduleEventsForClient,
} from "@/db/queries";
import { PortalShell } from "@/components/portal-shell";
import { ScheduleViewSwitcher } from "@/components/schedule/schedule-view-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePortalPerson } from "@/lib/current-person";
import { PortalRequestMeetingForm } from "@/app/portal/projects/request-meeting-form";
import { PortalScheduleList } from "@/app/portal/projects/schedule-list";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Schedule",
};

export default async function PortalScheduleHubPage() {
  const { person, client } = await requirePortalPerson();
  const [events, projects, people] = await Promise.all([
    listPortalScheduleEventsForClient(client.id),
    listPortalProjectsForClient(client.id),
    listPeople(client.id),
  ]);

  const calendarEvents = events.map((event) => ({
    id: event.id,
    projectId: event.projectId,
    title: event.title,
    status: event.status,
    startsAt: event.startsAt?.toISOString() ?? null,
    endsAt: event.endsAt?.toISOString() ?? null,
    projectTitle: event.projectTitle,
    href: `/projects/${event.projectId}/schedule`,
  }));

  return (
    <PortalShell>
      <div>
        <h1 className="section-heading">Schedule</h1>
        <p className="mt-2 max-w-2xl text-gray-700">
          Meetings across your projects. Request one with project and person
          selected — you are the default.
        </p>
      </div>

      <ScheduleViewSwitcher
        events={calendarEvents}
        createLabel="Request"
        createForm={
          <PortalRequestMeetingForm
            projects={projects.map((project) => ({
              id: project.id,
              title: project.title,
            }))}
            people={people.map((row) => ({
              id: row.id,
              name: row.name,
              role: row.role,
            }))}
            defaultPersonId={person.id}
            defaultProjectId={projects[0]?.id}
          />
        }
        list={
          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <PortalScheduleList
                events={events}
                showProject={projects.length > 1}
              />
            </CardContent>
          </Card>
        }
      />
    </PortalShell>
  );
}
