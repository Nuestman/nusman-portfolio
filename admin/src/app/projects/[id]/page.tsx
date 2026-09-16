import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import {
  ensureProjectMilestones,
  getClient,
  getLaunch,
  getProject,
  getProjectGateWork,
  listChangeRequests,
  listDemos,
  listNotes,
  listOptions,
  listPeople,
  listProjectEvents,
  countPortalMessages,
} from "@/db/queries";
import { ConfirmDelete } from "@/components/confirm-submit";
import { DeskShell } from "@/components/desk-shell";
import { EditableCard } from "@/components/editable-card";
import {
  EditLink,
  TableActionsCell,
  TableActionsHeader,
} from "@/components/table-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryNotice } from "@/components/query-notice";
import { PROCESS_GATES, type ProcessGate } from "@/db/schema";
import { isUuid } from "@/lib/ids";
import {
  gateGuide,
  gateMoveBlockMessage,
  gatesLocked,
  isGateMoveBlock,
  processGateIndex,
  toProcessGate,
} from "@/lib/gates";
import { projectStatusLabel, workKindLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { shouldServePortalUi } from "@/lib/serve-portal";
import { formatStamp, snippet } from "@/lib/text";
import { tableClassName, tableFrameClassName } from "@/lib/tables";
import { PortalProjectControls } from "@/app/portal-desk/project-controls";
import PortalProjectPage from "@/app/portal/projects/[id]/page";
import { DeliveryWork } from "../delivery-work";
import { EarlierStages } from "../earlier-stages";
import { GateSwitcher } from "../gate-switcher";
import { JobBriefCard } from "../job-brief-card";
import { MilestonesPanel } from "../milestones-panel";
import { NoteForm } from "../note-form";
import { ProposeAgreeWork } from "../propose-agree-work";
import { SalesWork } from "../sales-work";
import { SchedulePanel } from "../schedule-panel";
import { deleteNoteAction, deleteProjectAction } from "../actions";

export const dynamic = "force-dynamic";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
};

function projectNotice(raw: string | undefined): string | null {
  if (!raw) {
    return null;
  }
  if (isGateMoveBlock(raw)) {
    return gateMoveBlockMessage(raw);
  }
  if (raw === "chosen-option") {
    return "Choose another package first, or this stays the chosen one.";
  }
  if (raw === "option-client-summary") {
    return "Rewrite the client summary before choosing this package. Coaching hints stay on Desk only.";
  }
  if (raw === "confirm-title") {
    return "Type the title exactly to delete this record.";
  }
  if (raw === "milestone-order") {
    return "Complete earlier milestones before ticking this one.";
  }
  if (raw === "milestone-reopen") {
    return "Reopen later milestones first, then this one.";
  }
  return null;
}

function pastProcessGates(current: ProcessGate): ProcessGate[] {
  const index = processGateIndex(current);
  if (index <= 0) {
    return [];
  }
  return [...PROCESS_GATES.slice(0, index)];
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectDetailPageProps) {
  if (await shouldServePortalUi()) {
    return <PortalProjectPage params={params} />;
  }

  const { id } = await params;
  if (!isUuid(id)) {
    notFound();
  }

  const project = await getProject(id);
  if (!project) {
    notFound();
  }

  const isProduct = project.workKind === "product";
  const [
    email,
    client,
    people,
    notes,
    options,
    query,
    gateWork,
    delivery,
    portalMessageCount,
    events,
    milestones,
  ] = await Promise.all([
    getSessionEmail(),
    getClient(project.clientId),
    listPeople(project.clientId),
    listNotes(id),
    listOptions(id),
    searchParams,
    isProduct ? Promise.resolve(null) : getProjectGateWork(id),
    isProduct
      ? Promise.all([listChangeRequests(id), listDemos(id), getLaunch(id)]).then(
          ([changes, demos, launch]) => ({ changes, demos, launch }),
        )
      : Promise.resolve(null),
    isProduct ? Promise.resolve(0) : countPortalMessages(id),
    isProduct ? Promise.resolve([]) : listProjectEvents(id),
    isProduct ? Promise.resolve([]) : ensureProjectMilestones(id),
  ]);

  if (!client) {
    notFound();
  }

  const noticeRaw = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const notice = projectNotice(noticeRaw);
  const hasSelectedOption = options.some((option) => option.selected);
  const qualify = gateWork?.qualify ?? null;
  const intake = gateWork?.intake ?? [];
  const changes = gateWork?.changes ?? delivery?.changes ?? [];
  const demos = gateWork?.demos ?? delivery?.demos ?? [];
  const launch = gateWork?.launch ?? delivery?.launch ?? null;
  const problemAnswer =
    intake.find((row) => row.theme === "Problem")?.answer ?? null;
  const successAnswer =
    intake.find((row) => row.theme === "Success")?.answer ?? null;

  const processGate = toProcessGate(project.currentGate);
  const guide = gateGuide(project.currentGate);
  const earlier = isProduct ? [] : pastProcessGates(processGate);
  const disqualified = !isProduct && qualify?.outcome === "no";
  const pipelineLocked = disqualified || gatesLocked(project.status);

  const salesProps = gateWork
    ? {
        projectId: project.id,
        qualify: gateWork.qualify,
        intake: gateWork.intake,
        discovery: gateWork.discovery,
      }
    : null;

  const proposeProps = gateWork
    ? {
        projectId: project.id,
        currentGate: project.currentGate,
        options,
        agreement: gateWork.agreement,
      }
    : null;

  const deliveryProps = {
    projectId: project.id,
    isProduct,
    changes,
    demos,
    launch,
  };

  function stagePanels(gates: readonly ProcessGate[]) {
    if (gates.length === 0) {
      return null;
    }
    return (
      <>
        {salesProps &&
        gates.some((g) => g === "qualify" || g === "discover") ? (
          <SalesWork
            {...salesProps}
            include={gates.filter(
              (g): g is "qualify" | "discover" =>
                g === "qualify" || g === "discover",
            )}
          />
        ) : null}
        {proposeProps && gates.includes("plan") ? (
          <ProposeAgreeWork {...proposeProps} include={["plan"]} />
        ) : null}
        {gates.some((g) => g === "build" || g === "launch") ? (
          <DeliveryWork
            {...deliveryProps}
            include={gates.filter(
              (g): g is "build" | "launch" => g === "build" || g === "launch",
            )}
          />
        ) : null}
      </>
    );
  }

  return (
    <DeskShell email={email} width="3xl">
      <div>
        <Link
          href={isProduct ? "/products" : "/projects"}
          className={linkClassName("back")}
        >
          {isProduct ? "← Products" : "← Projects"}
        </Link>
        <h1 className="mt-3 section-heading">{project.title}</h1>
        <p className="mt-2 text-gray-700">
          {isProduct ? (
            `${workKindLabel(project.workKind)} · ${projectStatusLabel(project.status)}`
          ) : (
            <>
              <Link
                href={`/clients/${client.id}`}
                className={linkClassName("inline")}
              >
                {client.name}
              </Link>
              {" · "}
              {projectStatusLabel(project.status)}
              {" · "}
              {guide.label}
            </>
          )}
        </p>
        {!isProduct ? (
          <p className="mt-3 text-xs text-gray-500">
            <Link
              href={`/projects/${project.id}/classic`}
              className="underline decoration-gray-300 underline-offset-2 hover:text-gray-700"
            >
              Classic layout
            </Link>
          </p>
        ) : null}
      </div>

      <QueryNotice message={notice} />

      {disqualified ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          Disqualified — not a real project. The pipeline is closed (status Lost).
          Change Qualify outcome back to Real or Undecided to reopen.
        </p>
      ) : null}

      {!isProduct ? (
        <Card>
          <CardHeader>
            <CardTitle>Stage</CardTitle>
          </CardHeader>
          <CardContent>
            {pipelineLocked ? (
              <p className="mb-3 text-sm text-gray-600">
                Stage moves are locked while this project is{" "}
                {projectStatusLabel(project.status).toLowerCase()}.
              </p>
            ) : null}
            <GateSwitcher
              project={{
                id: project.id,
                currentGate: project.currentGate,
                problemSentence: project.problemSentence,
                status: project.status,
                workKind: project.workKind,
              }}
              people={people}
              hasSelectedOption={hasSelectedOption}
              qualifyOutcome={qualify?.outcome ?? "undecided"}
              intakeProblemAnswer={problemAnswer}
              intakeSuccessAnswer={successAnswer}
            />
            <p className="mt-3 text-sm text-gray-600">{guide.youDo}</p>
          </CardContent>
        </Card>
      ) : null}

      {isProduct ? (
        <JobBriefCard isProduct project={project} />
      ) : processGate === "qualify" || disqualified ? (
        <>
          {stagePanels(["qualify"])}
          <JobBriefCard
            isProduct={false}
            project={project}
            locked={disqualified}
          />
        </>
      ) : (
        <JobBriefCard isProduct={false} project={project} />
      )}

      {isProduct ? (
        <section className="space-y-4">
          <div>
            <h2 className="font-heading text-3xl text-dark-950">Product work</h2>
            <p className="mt-1 text-sm text-gray-600">
              Changes, demos, and launch for this own-product record.
            </p>
          </div>
          <DeliveryWork {...deliveryProps} />
        </section>
      ) : null}

      {!isProduct && !disqualified && processGate !== "qualify" ? (
        <section className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Current stage
            </p>
            <h2 className="font-heading text-3xl text-dark-950">{guide.label}</h2>
          </div>
          {stagePanels([processGate])}
        </section>
      ) : null}

      {!isProduct ? (
        <Card>
          <CardHeader>
            <CardTitle>Milestones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600">
              {disqualified
                ? "Checkpoints are frozen while this job is disqualified."
                : "Tick in order — finish earlier checkpoints before later ones. Payment commitment is a milestone + note for now."}
            </p>
            <MilestonesPanel
              projectId={project.id}
              milestones={milestones}
              locked={pipelineLocked}
            />
          </CardContent>
        </Card>
      ) : null}

      {!isProduct && !disqualified && earlier.length > 0 ? (
        <EarlierStages>{stagePanels(earlier)}</EarlierStages>
      ) : null}

      <EditableCard
        title="Timeline"
        hint={
          isProduct
            ? "Notes and stage moves."
            : "Calls, WhatsApp, stage moves, and package choices."
        }
        editLabel="Add"
        always={
          notes.length === 0 ? (
            <p className="text-sm text-gray-600">No timeline yet.</p>
          ) : (
            <div className={tableFrameClassName}>
              <table className={tableClassName}>
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Note</th>
                    <TableActionsHeader />
                  </tr>
                </thead>
                <tbody>
                  {notes.map((note) => (
                    <tr key={note.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {formatStamp(note.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {snippet(note.body)}
                        {note.clientVisible ? (
                          <span className="mt-1 block text-xs text-gray-500">
                            Portal visible
                          </span>
                        ) : null}
                      </td>
                      <TableActionsCell>
                        <EditLink
                          href={`/projects/${project.id}/notes/${note.id}/edit`}
                        />
                        <form action={deleteNoteAction}>
                          <input type="hidden" name="id" value={note.id} />
                          <input
                            type="hidden"
                            name="projectId"
                            value={project.id}
                          />
                          <ConfirmDelete
                            label="Remove"
                            message="Remove this note?"
                          />
                        </form>
                      </TableActionsCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        form={<NoteForm projectId={project.id} />}
      />

      {!isProduct ? (
        <SchedulePanel
          projectId={project.id}
          events={events}
          locked={pipelineLocked}
        />
      ) : null}

      {!isProduct && !disqualified ? (
        <Card>
          <CardHeader>
            <CardTitle>Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <PortalProjectControls
              projectId={project.id}
              portalIntakeOpen={project.portalIntakeOpen}
              messageCount={portalMessageCount}
              scheduleRequestCount={
                events.filter((event) => event.status === "requested").length
              }
            />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Remove {isProduct ? "product" : "project"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-gray-700">
          <p className="text-sm">
            Deletes this record and its notes, options, and stage forms.
          </p>
          <form action={deleteProjectAction}>
            <input type="hidden" name="id" value={project.id} />
            <input
              type="hidden"
              name="next"
              value={isProduct ? "/products" : "/projects"}
            />
            <ConfirmDelete
              label={isProduct ? "Delete product" : "Delete project"}
              size="default"
              confirmValue={project.title}
              message={`Deletes this ${isProduct ? "product" : "project"} and its notes, options, and stage forms. Type the title to confirm.`}
            />
          </form>
        </CardContent>
      </Card>
    </DeskShell>
  );
}
