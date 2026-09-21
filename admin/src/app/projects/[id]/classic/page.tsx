import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import {
  getClient,
  getLaunch,
  getProject,
  getProjectGateWork,
  getInboundLeadDraftByProject,
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
import { ProjectTimeline } from "@/components/project-timeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryNotice } from "@/components/query-notice";
import {
  inboundEmailNotice,
  PendingEmailBanner,
} from "@/components/pending-email-banner";
import { PROCESS_GATES, type ProcessGate } from "@/db/schema";
import { isUuid } from "@/lib/ids";
import {
  gateGuide,
  gateMoveBlockMessage,
  isGateMoveBlock,
  processGateIndex,
  toProcessGate,
} from "@/lib/gates";
import { projectStatusLabel, workKindLabel, WANT_BUILT_LABEL } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import {
  deskCopyTemplates,
  type CopyTemplate,
} from "@/lib/templates";
import { PortalProjectControls } from "@/app/portal-desk/project-controls";
import { CopyTemplates } from "../../copy-templates";
import { DeliveryWork } from "../../delivery-work";
import { EarlierStages } from "../../earlier-stages";
import { GateSwitcher } from "../../gate-switcher";
import { deleteProjectAction } from "../../actions";
import { ProjectDetailsForm } from "../../project-details-form";
import { ProposeAgreeWork } from "../../propose-agree-work";
import { SalesWork } from "../../sales-work";
import { SchedulePanel } from "../../schedule-panel";

export const dynamic = "force-dynamic";

/**
 * Archived pre-process project layout for reference.
 * Live UI: `/projects/[id]`.
 */
type ClassicProjectPageProps = {
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
    return "Rewrite the client summary before choosing this package.";
  }
  if (raw === "confirm-title") {
    return "Type the title exactly to delete this record.";
  }
  return inboundEmailNotice(raw);
}

function templatesForGate(
  gate: ProcessGate,
  templates: CopyTemplate[],
): CopyTemplate[] {
  switch (gate) {
    case "qualify":
      return templates.filter((item) => item.id === "reply");
    case "discover":
      return templates.filter(
        (item) =>
          item.id === "intake" ||
          item.id === "reply" ||
          item.id === "after-call",
      );
    case "plan":
    case "build":
    case "launch":
      return [];
    default: {
      const _exhaustive: never = gate;
      return _exhaustive;
    }
  }
}

function pastGates(current: ProcessGate): ProcessGate[] {
  const index = processGateIndex(current);
  if (index <= 0) {
    return [];
  }
  return [...PROCESS_GATES.slice(0, index)];
}

export default async function ClassicProjectPage({
  params,
  searchParams,
}: ClassicProjectPageProps) {
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

  const inboundDraft =
    !isProduct && project.status === "inactive"
      ? await getInboundLeadDraftByProject(id)
      : null;

  const noticeRaw = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const notice = projectNotice(noticeRaw);
  const hasSelectedOption = options.some((option) => option.selected);
  const allTemplates = isProduct
    ? []
    : deskCopyTemplates(project.problemSentence);
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
  const earlier = isProduct ? [] : pastGates(processGate);
  const stageTemplates = isProduct
    ? []
    : templatesForGate(processGate, allTemplates);

  const salesProps = gateWork
    ? {
        projectId: project.id,
        qualify: gateWork.qualify,
        wantBuilt: project.wantBuilt,
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

  function gatePanels(gates: readonly ProcessGate[]) {
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
    <DeskShell email={email}>
      <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        Classic archive layout for reference.{" "}
        <Link href={`/projects/${project.id}`} className={linkClassName("inline")}>
          Back to current project page
        </Link>
        .
      </div>

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

      {inboundDraft && project.status === "inactive" ? (
        <PendingEmailBanner
          projectId={project.id}
          next={`/projects/${project.id}/classic`}
        />
      ) : null}

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
          />
        </CardContent>
      </Card>

      <EditableCard
        title="Job details"
        view={
          <InfoList
            items={[
              { label: "Title", value: project.title },
              { label: "Problem sentence", value: project.problemSentence },
              ...(isProduct
                ? []
                : [{ label: WANT_BUILT_LABEL, value: project.wantBuilt }]),
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
              wantBuilt: project.wantBuilt ?? "",
              successLooksLike: project.successLooksLike ?? "",
              budgetNote: project.budgetNote ?? "",
              deadlineNote: project.deadlineNote ?? "",
              status: project.status,
            }}
            hideWantBuilt={isProduct}
          />
        }
      />

      {isProduct ? (
        <DeliveryWork {...deliveryProps} />
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="font-heading text-3xl text-dark-950">{guide.label}</h2>
            {gatePanels([processGate])}
            {stageTemplates.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Copy for this stage</CardTitle>
                </CardHeader>
                <CardContent>
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

      <ProjectTimeline
        projectId={project.id}
        notes={notes}
        variant="desk"
        hint="Calls, WhatsApp, stage moves, and package choices."
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
        <CardContent>
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
              message={`Deletes this ${isProduct ? "product" : "project"}. Type the title to confirm.`}
            />
          </form>
        </CardContent>
      </Card>
    </DeskShell>
  );
}
