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
import { isUuid } from "@/lib/ids";
import { gateMoveBlockMessage, isGateMoveBlock } from "@/lib/gates";
import { projectStatusLabel, workKindLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { formatStamp, snippet } from "@/lib/text";
import { tableClassName, tableFrameClassName } from "@/lib/tables";
import { deskCopyTemplates } from "@/lib/templates";
import { CopyTemplates } from "../copy-templates";
import { DeliveryWork } from "../delivery-work";
import { GateSwitcher } from "../gate-switcher";
import { NoteForm } from "../note-form";
import { ProjectDetailsForm } from "../project-details-form";
import { ProposeAgreeWork } from "../propose-agree-work";
import { SalesWork } from "../sales-work";
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
  if (raw === "confirm-title") {
    return "Type the title exactly to delete this record.";
  }
  return null;
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
  const [email, client, people, notes, options, query, gateWork, delivery] =
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
    ]);

  if (!client) {
    notFound();
  }

  const noticeRaw = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const notice = projectNotice(noticeRaw);
  const hasSelectedOption = options.some((option) => option.selected);
  const copyTemplates = isProduct
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

  return (
    <DeskShell email={email} width="3xl">
        <div>
          <Link
            href={isProduct ? "/products" : "/projects"}
            className={linkClassName("back")}
          >
            {isProduct ? "← Products" : "← Projects"}
          </Link>
          <h1 className="mt-3 section-heading">
            {project.title}
          </h1>
          <p className="mt-2 text-gray-700">
            {isProduct ? (
              `${workKindLabel(project.workKind)}. The live app and database stay on their own Neon project.`
            ) : (
              <>
                Client:{" "}
                <Link
                  href={`/clients/${client.id}`}
                  className={linkClassName("inline")}
                >
                  {client.name}
                </Link>
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

        {isProduct || !gateWork ? null : (
          <SalesWork
            projectId={project.id}
            qualify={gateWork.qualify}
            intake={gateWork.intake}
            discovery={gateWork.discovery}
          />
        )}

        <EditableCard
          title="Project"
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

        {isProduct || !gateWork ? null : (
          <ProposeAgreeWork
            projectId={project.id}
            currentGate={project.currentGate}
            options={options}
            agreement={gateWork.agreement}
          />
        )}

        <DeliveryWork
          projectId={project.id}
          isProduct={isProduct}
          changes={changes}
          demos={demos}
          launch={launch}
        />

        {copyTemplates.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-sm text-gray-600">
                Copy into WhatsApp or email. Fill the brackets before you send.
              </p>
              <CopyTemplates templates={copyTemplates} />
            </CardContent>
          </Card>
        ) : null}

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
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                          {formatStamp(note.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {snippet(note.body)}
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
