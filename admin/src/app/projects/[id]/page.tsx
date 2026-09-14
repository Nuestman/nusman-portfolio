import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import {
  getClient,
  getProject,
  listNotes,
  listOptions,
  listPeople,
} from "@/db/queries";
import { DeskHeader } from "@/components/desk-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { buttonClassName } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isUuid } from "@/lib/ids";
import {
  GATE_GUIDES,
  gateGuide,
  gateMoveBlock,
  gateMoveBlockMessage,
  isGateMoveBlock,
} from "@/lib/gates";
import { optionKindLabel } from "@/lib/labels";
import { deskCopyTemplates, optionStarter, unusedOptionKinds } from "@/lib/templates";
import {
  deleteOptionAction,
  moveGateAction,
  selectOptionAction,
} from "../actions";
import { CopyTemplates } from "../copy-templates";
import { NoteForm } from "../note-form";
import { OptionForm } from "../option-form";
import { ProjectDetailsForm } from "../project-details-form";

export const dynamic = "force-dynamic";

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
};

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

  const [email, client, people, notes, options, query] = await Promise.all([
    getSessionEmail(),
    getClient(project.clientId),
    listPeople(project.clientId),
    listNotes(id),
    listOptions(id),
    searchParams,
  ]);

  if (!client) {
    notFound();
  }

  const noticeRaw = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const notice =
    noticeRaw && isGateMoveBlock(noticeRaw)
      ? gateMoveBlockMessage(noticeRaw)
      : null;
  const current = gateGuide(project.currentGate);
  const remainingKinds = unusedOptionKinds(options.map((item) => item.kind));
  const onlyKind = remainingKinds.length === 1 ? remainingKinds[0] : undefined;
  const copyTemplates = deskCopyTemplates(project.problemSentence);

  return (
    <div className="min-h-full">
      <DeskHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div>
          <Link
            href="/projects"
            className="text-sm text-dark-950 hover:text-gold-500"
          >
            ← Projects
          </Link>
          <h1 className="mt-3 font-heading text-3xl text-dark-950 md:text-4xl">
            {project.title}
          </h1>
          <p className="mt-2 text-gray-700">
            Client:{" "}
            <Link
              href={`/clients/${client.id}`}
              className="text-dark-950 hover:text-gold-500"
            >
              {client.name}
            </Link>
          </p>
        </div>

        {notice ? (
          <p className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700" role="alert">
            {notice}
          </p>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Gate</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex flex-wrap gap-2">
              {GATE_GUIDES.map((item) => {
                const blocked = gateMoveBlock({
                  from: project.currentGate,
                  to: item.id,
                  people,
                });
                const active = item.id === project.currentGate;
                if (active) {
                  return (
                    <span
                      key={item.id}
                      className="rounded-full border border-gold-500 bg-gold-500 px-3 py-1.5 text-sm text-white"
                    >
                      {item.label}
                    </span>
                  );
                }
                if (blocked) {
                  return (
                    <span
                      key={item.id}
                      title={gateMoveBlockMessage(blocked)}
                      className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-500"
                    >
                      {item.label}
                    </span>
                  );
                }
                return (
                  <form key={item.id} action={moveGateAction}>
                    <input type="hidden" name="id" value={project.id} />
                    <input type="hidden" name="gate" value={item.id} />
                    <button
                      type="submit"
                      className={cn(
                        "rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-dark-950 hover:border-gold-500",
                      )}
                    >
                      {item.label}
                    </button>
                  </form>
                );
              })}
            </div>
            <div className="rounded-xl bg-gray-200 p-4 text-sm text-gray-700 space-y-2">
              <p>
                <span className="font-medium text-dark-950">Public: </span>
                {current.publicStep}
              </p>
              <p>
                <span className="font-medium text-dark-950">You: </span>
                {current.youDo}
              </p>
              <p>
                <span className="font-medium text-dark-950">They: </span>
                {current.theyDo}
              </p>
              <p>
                <span className="font-medium text-dark-950">Exit when: </span>
                {current.exitWhen}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project</CardTitle>
          </CardHeader>
          <CardContent>
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
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <p className="text-sm text-gray-600">
              Offer light, recommended, and later. Choose one before you agree.
            </p>
            {options.length === 0 ? (
              <p className="text-sm text-gray-600">No packages yet.</p>
            ) : (
              <ul className="space-y-4">
                {options.map((option) => (
                  <li
                    key={option.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-dark-950">
                          {optionKindLabel(option.kind)}
                          {option.selected ? (
                            <span className="ml-2 rounded-full bg-gold-500 px-2 py-0.5 text-xs text-white">
                              Chosen
                            </span>
                          ) : null}
                        </p>
                        {option.priceNote || option.timelineNote ? (
                          <p className="mt-1 text-sm text-gray-500">
                            {[option.priceNote, option.timelineNote]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-3">
                        {option.selected ? null : (
                          <form action={selectOptionAction}>
                            <input type="hidden" name="id" value={option.id} />
                            <input
                              type="hidden"
                              name="projectId"
                              value={project.id}
                            />
                            <button
                              type="submit"
                              className={buttonClassName("outline", "sm")}
                            >
                              Choose this
                            </button>
                          </form>
                        )}
                        <Link
                          href={`/projects/${project.id}/options/${option.id}/edit`}
                          className="text-sm text-dark-950 hover:text-gold-500"
                        >
                          Edit
                        </Link>
                        <form action={deleteOptionAction}>
                          <input type="hidden" name="id" value={option.id} />
                          <input
                            type="hidden"
                            name="projectId"
                            value={project.id}
                          />
                          <ConfirmSubmit
                            label="Remove"
                            message={`Remove the ${optionKindLabel(option.kind).toLowerCase()} option?`}
                          />
                        </form>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-gray-700">
                      {option.summary}
                    </p>
                    {option.inScope ? (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-dark-950">In: </span>
                        {option.inScope}
                      </p>
                    ) : null}
                    {option.outOfScope ? (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-dark-950">Out: </span>
                        {option.outOfScope}
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
            {remainingKinds.length === 0 ? (
              <p className="text-sm text-gray-600">
                All three packages are on this project.
              </p>
            ) : (
              <div>
                <h3 className="mb-4 font-heading text-xl text-dark-950">
                  Add option
                </h3>
                <OptionForm
                  submitLabel="Add option"
                  availableKinds={remainingKinds}
                  option={{
                    projectId: project.id,
                    kind: onlyKind ?? "",
                    summary: onlyKind ? optionStarter(onlyKind) : "",
                    priceNote: "",
                    timelineNote: "",
                    inScope: "",
                    outOfScope: "",
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

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

        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <NoteForm projectId={project.id} />
            {notes.length === 0 ? (
              <p className="text-sm text-gray-600">No notes yet.</p>
            ) : (
              <ul className="space-y-4">
                {notes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <p className="text-xs text-gray-500">
                      {note.createdAt.toLocaleString()}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                      {note.body}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
