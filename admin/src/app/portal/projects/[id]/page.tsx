import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ensureProjectMilestones,
  getPortalProjectForPerson,
  getSelectedOption,
  listClientVisibleNotes,
  listProjectEvents,
} from "@/db/queries";
import { PortalShell } from "@/components/portal-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePortalPerson } from "@/lib/current-person";
import { gateGuide } from "@/lib/gates";
import { isUuid } from "@/lib/ids";
import {
  projectStatusLabel,
  optionKindLabel,
  projectEventKindLabel,
  projectEventStatusLabel,
} from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { formatEventWhen, formatStamp } from "@/lib/text";
import { isOptionStarterSummary } from "@/lib/templates";
import { tableClassName, tableFrameClassName } from "@/lib/tables";
import { InfoList } from "@/components/info-list";

export const dynamic = "force-dynamic";

type PortalProjectPageProps = {
  params: Promise<{ id: string }>;
};

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
  const upcoming = events.filter(
    (event) =>
      event.status === "proposed" ||
      event.status === "confirmed" ||
      event.status === "requested",
  );
  const doneCount = milestones.filter((item) => item.doneAt).length;

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
            href={`/projects/${project.id}/intake`}
            className={linkClassName("nav")}
          >
            Discovery
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

      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <p>
            <span className="font-medium text-dark-950">Stage:</span>{" "}
            {guide.publicStep}
          </p>
          <p>
            <span className="font-medium text-dark-950">Status:</span>{" "}
            {projectStatusLabel(project.status)}
          </p>
          <p>
            <span className="font-medium text-dark-950">Milestones:</span>{" "}
            {doneCount} of {milestones.length} done
          </p>
          {project.problemSentence ? (
            <p>
              <span className="font-medium text-dark-950">Problem:</span>{" "}
              {project.problemSentence}
            </p>
          ) : null}
          {project.successLooksLike ? (
            <p>
              <span className="font-medium text-dark-950">Success looks like:</span>{" "}
              {project.successLooksLike}
            </p>
          ) : null}
          <ul className="mt-4 space-y-2">
            {milestones.map((item) => (
              <li key={item.id} className="flex items-start gap-2">
                <span
                  className={
                    item.doneAt
                      ? "mt-0.5 text-gold-600"
                      : "mt-0.5 text-gray-400"
                  }
                  aria-hidden
                >
                  {item.doneAt ? "✓" : "○"}
                </span>
                <span
                  className={
                    item.doneAt ? "text-gray-500 line-through" : "text-dark-950"
                  }
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
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
            className={linkClassName("back")}
          >
            Open
          </Link>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
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
          ) : (
            <ul className="space-y-3">
              {upcoming.slice(0, 3).map((event) => (
                <li key={event.id} className="text-sm text-gray-700">
                  <span className="font-medium text-dark-950">
                    {event.title}
                  </span>
                  {" · "}
                  {projectEventKindLabel(event.kind)} ·{" "}
                  {projectEventStatusLabel(event.status)} ·{" "}
                  {formatEventWhen(event.startsAt)}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <p className="text-sm text-gray-600">No client updates yet.</p>
          ) : (
            <div className={tableFrameClassName}>
              <table className={tableClassName}>
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note) => (
                    <tr key={note.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {formatStamp(note.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{note.body}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
