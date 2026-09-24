import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPortalProjectForPerson,
  listPeople,
  listPortalProjectsForClient,
  listProjectEvents,
} from "@/db/queries";
import { PortalShell } from "@/components/portal-shell";
import { PageSpread } from "@/components/page-spread";
import { QueryNotice } from "@/components/query-notice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableCard } from "@/components/editable-card";
import { getPortalSessionPerson, requirePortalPerson } from "@/lib/current-person";
import { isUuid } from "@/lib/ids";
import { linkClassName } from "@/lib/links";
import { PortalRequestMeetingForm } from "../../request-meeting-form";
import { PortalScheduleList } from "../../schedule-list";

export const dynamic = "force-dynamic";

type PortalSchedulePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) {
    return { title: "Schedule" };
  }
  const session = await getPortalSessionPerson().catch(() => null);
  if (!session) {
    return { title: "Schedule" };
  }
  const project = await getPortalProjectForPerson(id, session.client.id).catch(
    () => null,
  );
  return {
    title: project?.title ? `${project.title} · Schedule` : "Schedule",
  };
}

export default async function PortalSchedulePage({
  params,
  searchParams,
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

  const [events, projects, people, query] = await Promise.all([
    listProjectEvents(project.id),
    listPortalProjectsForClient(client.id),
    listPeople(client.id),
    searchParams,
  ]);

  const noticeRaw = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const afterCreate = noticeRaw === "started";
  const schedulePath = `/projects/${project.id}/schedule`;

  return (
    <PortalShell>
      <PageSpread
        intro={
          <>
            <Link
              href={`/projects/${project.id}`}
              className={linkClassName("back")}
            >
              ← {project.title}
            </Link>
            <h1 className="mt-3 section-heading">Schedule</h1>
            <p className="mt-2 text-gray-700">
              {afterCreate
                ? "Project created. Request a call when you’re free — or skip and open the project anytime."
                : "Confirm times Usman proposes, or request a meeting."}
            </p>
            {afterCreate ? (
              <p className="mt-2 text-sm">
                <Link
                  href={`/projects/${project.id}`}
                  className={linkClassName("nav")}
                >
                  Skip for now
                </Link>
                {" · "}
                <Link href="/schedule" className={linkClassName("nav")}>
                  All schedule
                </Link>
              </p>
            ) : (
              <p className="mt-2 text-sm">
                <Link href="/schedule" className={linkClassName("nav")}>
                  All schedule
                </Link>
              </p>
            )}
          </>
        }
      >
        {afterCreate ? (
          <QueryNotice message="Project created. Next: request a call." />
        ) : null}

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
          title={afterCreate ? "Request a call" : "Request a meeting"}
          hint={
            afterCreate
              ? "Defaults to a discovery call. Pick a preferred time if you have one."
              : "Defaults to you; pick another person on the account if needed."
          }
          editLabel="Request"
          defaultEditing={afterCreate}
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
              defaultKind={afterCreate ? "call" : "meeting"}
              defaultTitle={afterCreate ? "Discovery call" : ""}
              lockProject
              submitLabel={afterCreate ? "Request call" : "Request meeting"}
              returnPath={schedulePath}
            />
          }
          view={
            <p className="text-sm text-gray-600">
              Need a call, demo, or meeting? Tap Request.
            </p>
          }
        />
      </PageSpread>
    </PortalShell>
  );
}
