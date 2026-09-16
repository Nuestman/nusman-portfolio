import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import {
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
import { InfoList } from "@/components/info-list";
import {
  EditLink,
  TableActionsCell,
  TableActionsHeader,
} from "@/components/table-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryNotice } from "@/components/query-notice";
import { PROJECT_GATES, type ProjectGate } from "@/db/schema";
import { isUuid } from "@/lib/ids";
import {
  gateGuide,
  gateIndex,
  gateMoveBlockMessage,
  isGateMoveBlock,
} from "@/lib/gates";
import { projectStatusLabel, workKindLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { formatStamp, snippet } from "@/lib/text";
import { tableClassName, tableFrameClassName } from "@/lib/tables";
import {
  deskCopyTemplates,
  type CopyTemplate,
} from "@/lib/templates";
import { PortalProjectControls } from "@/app/portal-desk/project-controls";
import { CopyTemplates } from "../copy-templates";
import { DeliveryWork } from "../delivery-work";
import { EarlierStages } from "../earlier-stages";
import { GateSwitcher } from "../gate-switcher";
import { NoteForm } from "../note-form";
import { ProjectDetailsForm } from "../project-details-form";
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
  return null;
}

function templatesForGate(
  gate: ProjectGate,
  templates: CopyTemplate[],
): CopyTemplate[] {
  switch (gate) {
    case "qualify":
      return templates.filter((item) => item.id === "reply");
    case "intake":
      return templates.filter(
        (item) => item.id === "intake" || item.id === "reply",
      );
    case "discover":
      return templates.filter((item) => item.id === "after-call");
    case "propose":
    case "agree":
    case "build":
    case "launch":
      return [];
    default: {
      const _exhaustive: never = gate;
      return _exhaustive;
    }
  }
}

function pastGates(current: ProjectGate): ProjectGate[] {
  const index = gateIndex(current);
  if (index <= 0) {
    return [];
  }
  return PROJECT_GATES.slice(0, index);
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: ProjectDetailPageProps) {
  const { id } = await params;
  if (!isUuid(id)) {
    notFound();
  }

  const project = await getProject(id);
  if (!project) {
    notFound();
  }

  const isProduct = project.workKind === "product";
  const [email, client, people, notes, options, query, gateWork, delivery, portalMessageCount, events] =
    await Promise.all([
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
    ]);

  if (!client) {
    notFound();
  }

  const noticeRaw = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const notice = projectNotice(noticeRaw);
  const hasSelectedOption = options.some((option) => option.selected);
  const allTemplates = isProduct
    ? []
    : deskCopyTemplates(project.problemSentence);
  const qualify = gateWork?.qualify ?? null;
  const intake = gateWork?.intake ?? [];
  const agreement = gateWork?.agreement ?? null;
  const changes = gateWork?.changes ?? delivery?.changes ?? [];
  const demos = gateWork?.demos ?? delivery?.demos ?? [];
  const launch = gateWork?.launch ?? delivery?.launch ?? null;
  const problemAnswer =
    intake.find((row) => row.theme === "Problem")?.answer ?? null;
  const successAnswer =
    intake.find((row) => row.theme === "Success")?.answer ?? null;

  const guide = gateGuide(project.currentGate);
  const earlier = isProduct ? [] : pastGates(project.currentGate);
  const stageTemplates = isProduct
    ? []
    : templatesForGate(project.currentGate, allTemplates);

  const jobDetailsCard = (
    <EditableCard
      title="Job details"
      hint={
        isProduct
          ? undefined
          : "Problem sentence is needed before you leave Discover."
      }
      view={
        <InfoList
          items={[
            { label: "Title", value: project.title },
            { label: "Problem sentence", value: project.problemSentence },
            { label: "Success looks like", value: project.successLooksLike },
            { label: "Budget note", value: project.budgetNote },
            { label: "Deadline note", value: project.deadlineNote },
            { label: "Status", value: projectStatusLabel(project.status) },
          ]}
        />
      }
      form={
        <ProjectDetailsForm
          project={{
            id: project.id,
            title: project.title,
            problemSentence: project.problemSentence ?? "",
            successLooksLike: project.successLooksLike ?? "",
            budgetNote: project.budgetNote ?? "",
            deadlineNote: project.deadlineNote ?? "",
            status: project.status,
          }}
          problemHint={
            isProduct ? undefined : "Needed before you leave Discover."
          }
        />
      }
    />
  );

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

  function gatePanels(gates: readonly ProjectGate[]) {
    if (gates.length === 0) {
      return null;
    }
    return (
      <>
        {salesProps &&
        gates.some((g) => g === "qualify" || g === "intake" || g === "discover") ? (
          <SalesWork
            {...salesProps}
            include={gates.filter(
              (g): g is "qualify" | "intake" | "discover" =>
                g === "qualify" || g === "intake" || g === "discover",
            )}
          />
        ) : null}
        {proposeProps &&
        gates.some((g) => g === "propose" || g === "agree") ? (
          <ProposeAgreeWork
            {...proposeProps}
            include={gates.filter(
              (g): g is "propose" | "agree" =>
                g === "propose" || g === "agree",
            )}
          />
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
      </div>

      <QueryNotice message={notice} />

      <Card>
        <CardHeader>
          <CardTitle>Gate</CardTitle>
        </CardHeader>
        <CardContent>
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
            depositPaid={agreement?.depositPaid ?? false}
            agreementConfirmed={agreement?.confirmed ?? false}
          />
        </CardContent>
      </Card>

      {jobDetailsCard}

      {isProduct ? (
        <>
          <section className="space-y-4">
            <div>
              <h2 className="font-heading text-3xl text-dark-950">
                Product work
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Changes, demos, and launch for this own-product record.
              </p>
            </div>
            <DeliveryWork {...deliveryProps} />
          </section>
        </>
      ) : (
        <>
          <section className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Current stage
                </p>
                <h2 className="font-heading text-3xl text-dark-950">
                  {guide.label}
                </h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-600">
                  {guide.youDo}{" "}
                  <Link href="/playbook" className={linkClassName("inline")}>
                    Playbook
                  </Link>
                </p>
              </div>
            </div>

            {gatePanels([project.currentGate])}

            {stageTemplates.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Copy for this stage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-6 text-sm text-gray-600">
                    From the playbook. Fill the brackets before you send. Full
                    guide stays on{" "}
                    <Link href="/playbook" className={linkClassName("inline")}>
                      Playbook
                    </Link>
                    .
                  </p>
                  <CopyTemplates templates={stageTemplates} />
                </CardContent>
              </Card>
            ) : null}
          </section>

          {earlier.length > 0 ? (
            <EarlierStages>{gatePanels(earlier)}</EarlierStages>
          ) : null}
        </>
      )}

      <EditableCard
        title="Timeline"
        hint={
          isProduct
            ? "Notes and gate moves."
            : "Calls, WhatsApp, gate moves, and the chosen package."
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

      {!isProduct ? <SchedulePanel projectId={project.id} events={events} /> : null}

      {!isProduct ? (
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
            Deletes this record and its notes, options, and gate forms.
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
              message={`Deletes this ${isProduct ? "product" : "project"} and its notes, options, and gate forms. Type the title to confirm.`}
            />
          </form>
        </CardContent>
      </Card>
    </DeskShell>
  );
}
