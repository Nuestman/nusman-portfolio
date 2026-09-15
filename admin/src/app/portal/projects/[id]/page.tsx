import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPortalProjectForPerson,
  getSelectedOption,
  listClientVisibleNotes,
} from "@/db/queries";
import { PortalShell } from "@/components/portal-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePortalPerson } from "@/lib/current-person";
import { gateGuide } from "@/lib/gates";
import { isUuid } from "@/lib/ids";
import { projectStatusLabel, optionKindLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { formatStamp } from "@/lib/text";
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

  const [notes, selected] = await Promise.all([
    listClientVisibleNotes(project.id),
    getSelectedOption(project.id),
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
            href={`/projects/${project.id}/intake`}
            className={linkClassName("nav")}
          >
            Intake
          </Link>
          <Link
            href={`/projects/${project.id}/messages`}
            className={linkClassName("nav")}
          >
            Messages
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
            {guide.label}
          </p>
          <p>
            <span className="font-medium text-dark-950">Status:</span>{" "}
            {projectStatusLabel(project.status)}
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
