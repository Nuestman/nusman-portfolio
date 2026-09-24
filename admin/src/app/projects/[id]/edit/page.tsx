import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import {
  countPortalMessages,
  getClient,
  getProject,
  getQualify,
  listProjectEvents,
} from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { PageSpread } from "@/components/page-spread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortalProjectControls } from "@/app/portal-desk/project-controls";
import { isUuid } from "@/lib/ids";
import { gateGuide, toProcessGate } from "@/lib/gates";
import {
  projectStatusLabel,
  workKindLabel,
} from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { shouldServePortalUi } from "@/lib/serve-portal";
import { ProjectDetailsForm } from "../../project-details-form";
import { QualifyForm } from "../../qualify-form";

export const dynamic = "force-dynamic";

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditProjectPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) {
    return { title: "Edit project · Desk" };
  }
  const project = await getProject(id).catch(() => null);
  return {
    title: project
      ? `Edit ${project.title} · Desk`
      : "Edit project · Desk",
  };
}

export default async function EditProjectPage({
  params,
}: EditProjectPageProps) {
  if (await shouldServePortalUi()) {
    notFound();
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
  const [email, client, qualify, portalMessageCount, events] =
    await Promise.all([
      getSessionEmail(),
      getClient(project.clientId),
      isProduct ? Promise.resolve(null) : getQualify(id),
      isProduct ? Promise.resolve(0) : countPortalMessages(id),
      isProduct ? Promise.resolve([]) : listProjectEvents(id),
    ]);

  if (!client) {
    notFound();
  }

  const editPath = `/projects/${project.id}/edit`;
  const guide = gateGuide(project.currentGate);
  const processGate = toProcessGate(project.currentGate);

  return (
    <DeskShell email={email}>
      <PageSpread
        intro={
          <>
            <Link
              href={`/projects/${project.id}`}
              className={linkClassName("back")}
            >
              ← {project.title}
            </Link>
            <h1 className="mt-3 section-heading">
              Edit {isProduct ? "product" : "project"}
            </h1>
            <p className="mt-2 text-gray-700">
              {isProduct ? (
                <>
                  {workKindLabel(project.workKind)} ·{" "}
                  {projectStatusLabel(project.status)}
                </>
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
          </>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>{isProduct ? "Product details" : "Brief"}</CardTitle>
          </CardHeader>
          <CardContent>
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
              problemHint={
                isProduct
                  ? undefined
                  : "Needed before you leave Discover."
              }
              hideBudget={!isProduct}
              hideWantBuilt={isProduct}
              submitLabel={isProduct ? "Save product" : "Save brief"}
              nextPath={editPath}
            />
          </CardContent>
        </Card>

        {!isProduct ? (
          <Card>
            <CardHeader>
              <CardTitle>Qualify</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Hiring screen — outcome, who it is for, timeline, budget, and
                call window. Stage moves still use the project page.
              </p>
              <QualifyForm
                projectId={project.id}
                nextPath={editPath}
                qualify={{
                  outcome: qualify?.outcome ?? "undecided",
                  whoFor: qualify?.whoFor ?? "",
                  painToday: qualify?.painToday ?? "",
                  wantBuilt: project.wantBuilt ?? "",
                  neededBy: qualify?.neededBy ?? "",
                  budgetNote: qualify?.budgetNote ?? "",
                  callAt: qualify?.callAt ?? "",
                  notes: qualify?.notes ?? "",
                }}
              />
            </CardContent>
          </Card>
        ) : null}

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

        <p className="text-sm text-gray-600">
          Discovery answers, packages, agreement, delivery, schedule, and
          milestones stay on the{" "}
          <Link
            href={`/projects/${project.id}`}
            className={linkClassName("inline")}
          >
            project page
          </Link>
          {processGate === "qualify"
            ? " (Qualify stage)."
            : ` (current stage: ${guide.label}).`}
        </p>
      </PageSpread>
    </DeskShell>
  );
}
