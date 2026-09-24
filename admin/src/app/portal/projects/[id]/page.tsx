import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ensureProjectMilestones,
  getPortalProjectForPerson,
  getSelectedOption,
  listClientVisibleNotes,
  listProjectEvents,
} from "@/db/queries";
import { PortalScheduleList } from "@/app/portal/projects/schedule-list";
import { InfoList } from "@/components/info-list";
import { PortalProgress } from "@/components/portal-progress";
import { PortalShell } from "@/components/portal-shell";
import { ProjectTimeline } from "@/components/project-timeline";
import { ScrollChain } from "@/components/scroll-chain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { getPortalSessionPerson, requirePortalPerson } from "@/lib/current-person";
import { gateGuide } from "@/lib/gates";
import { isUuid } from "@/lib/ids";
import {
  projectStatusLabel,
  optionKindLabel,
} from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { isOptionStarterSummary } from "@/lib/templates";

export const dynamic = "force-dynamic";

type PortalProjectPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) {
    return { title: "Project" };
  }
  const session = await getPortalSessionPerson().catch(() => null);
  if (!session) {
    return { title: "Project" };
  }
  const project = await getPortalProjectForPerson(id, session.client.id).catch(
    () => null,
  );
  return { title: project?.title ?? "Project" };
}

export default async function PortalProjectPage({
  params,
}: PortalProjectPageProps) {
  const { id } = await params;
  if (!isUuid(id)) {
    notFound();
  }

  const { client } = await requirePortalPerson();
  const project = await getPortalProjectForPerson(id, client.id);
  if (!project) {
    notFound();
  }

  const [notes, selected, events, milestones] = await Promise.all([
    listClientVisibleNotes(project.id),
    getSelectedOption(project.id),
    listProjectEvents(project.id),
    ensureProjectMilestones(project.id),
  ]);
  const guide = gateGuide(project.currentGate);

  return (
    <PortalShell>
      <div>
        <Link href="/projects" className={linkClassName("back")}>
          ← Projects
        </Link>
        <h1 className="mt-3 section-heading">{project.title}</h1>
        <p className="mt-2 text-gray-700">
          {guide.publicStep} · {projectStatusLabel(project.status)}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <Link
            href={`/projects/${project.id}/brief`}
            className={linkClassName("nav")}
          >
            Brief
          </Link>
          <Link
            href={`/messages/${project.id}`}
            className={linkClassName("nav")}
          >
            Messages
          </Link>
          <Link
            href={`/projects/${project.id}/schedule`}
            className={linkClassName("nav")}
          >
            Schedule
          </Link>
        </div>
      </div>

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,32rem)] xl:gap-12">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <PortalProgress
                publicStep={guide.publicStep}
                status={project.status}
                problem={project.problemSentence}
                wantBuilt={project.wantBuilt}
                success={project.successLooksLike}
                milestones={milestones}
              />
            </CardContent>
          </Card>

          {selected ? (
            <Card>
              <CardHeader>
                <CardTitle>Your package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const clientSummary = isOptionStarterSummary(
                    selected.summary,
                    selected.kind,
                  )
                    ? null
                    : selected.summary;
                  const items = [
                    {
                      label: "Package",
                      value: optionKindLabel(selected.kind),
                    },
                    { label: "Summary", value: clientSummary },
                    { label: "Price", value: selected.priceNote },
                    { label: "Timeline", value: selected.timelineNote },
                    { label: "Included", value: selected.inScope },
                    { label: "Not included", value: selected.outOfScope },
                  ].filter((item) => Boolean(item.value?.trim()));

                  if (items.length <= 1 && !clientSummary) {
                    return (
                      <p className="text-sm text-gray-600">
                        You&apos;re on the{" "}
                        <span className="font-medium text-dark-950">
                          {optionKindLabel(selected.kind)}
                        </span>{" "}
                        package. Full details will show here once Usman finishes
                        writing them.
                      </p>
                    );
                  }

                  return <InfoList items={items} />;
                })()}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
              <CardTitle>Schedule</CardTitle>
              <Link
                href={`/projects/${project.id}/schedule`}
                className={buttonClassName("outline", "sm")}
              >
                Open
              </Link>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-gray-600">
                Confirm times Usman proposes, or request a meeting.
              </p>
              <PortalScheduleList
                events={events.map((event) => ({
                  ...event,
                  projectId: project.id,
                }))}
                returnTo={`/projects/${project.id}`}
                empty={
                  <p className="text-sm text-gray-600">
                    No upcoming meetings.{" "}
                    <Link
                      href={`/projects/${project.id}/schedule`}
                      className={linkClassName("nav")}
                    >
                      Request one
                    </Link>
                    .
                  </p>
                }
              />
            </CardContent>
          </Card>
        </div>

        <aside>
          <ScrollChain className="xl:max-h-[min(40rem,calc(100dvh-var(--desk-header-height)-6rem))] xl:overflow-y-auto xl:pr-1">
            <ProjectTimeline
              projectId={project.id}
              notes={notes}
              variant="portal"
            />
          </ScrollChain>
        </aside>
      </div>
    </PortalShell>
  );
}

