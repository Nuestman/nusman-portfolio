import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { loadFromDb } from "@/db";
import {
  countClients,
  countProjects,
  getOperator,
  listActiveProjects,
  listActivities,
} from "@/db/queries";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseNotice } from "@/components/database-notice";
import { DeskShell } from "@/components/desk-shell";
import { ConfirmDelete } from "@/components/confirm-submit";
import {
  EditLink,
  TableActionsCell,
  TableActionsHeader,
} from "@/components/table-actions";
import { gateGuide } from "@/lib/gates";
import { linkClassName } from "@/lib/links";
import { tableClassName, tableFrameClassName } from "@/lib/tables";
import { deskCopyTemplates } from "@/lib/templates";
import { CopyTemplates } from "@/app/projects/copy-templates";
import { deleteProjectAction } from "@/app/projects/actions";
import { ActivityForm } from "@/app/log/activity-form";
import { ActivityList } from "@/app/log/activity-list";

export const dynamic = "force-dynamic";

const PROCESS_STEPS = [
  {
    title: "Discover & Plan",
    body: "Align on the goal, constraints, and a clear plan.",
  },
  {
    title: "Build & Test",
    body: "Develop, test, and share progress as we go.",
  },
  {
    title: "Launch & Support",
    body: "Ship it, walk them through it, and stay available.",
  },
] as const;

async function loadDeskStats() {
  return loadFromDb(async () => {
    const [projectCount, clientCount, operator, active, recentLog] =
      await Promise.all([
        countProjects(),
        countClients(),
        getOperator(),
        listActiveProjects(),
        listActivities(5),
      ]);
    return {
      projectCount,
      clientCount,
      operatorName: operator?.name ?? null,
      active,
      recentLog,
    };
  });
}

export default async function HomePage() {
  const email = await getSessionEmail();
  const stats = await loadDeskStats();

  return (
    <DeskShell email={email}>
        <div>
          <h1 className="section-heading">Today</h1>
          <p className="mt-2 max-w-2xl text-gray-700">
            Active work and the current gate. Nothing starts from a chat message.
          </p>
        </div>

        <div className="relative">
          <div
            className="absolute inset-x-[6%] inset-y-0 rounded-3xl bg-gray-200"
            aria-hidden="true"
          />
          <div className="relative grid gap-4 px-2 py-8 md:grid-cols-3">
            {PROCESS_STEPS.map((step) => (
              <Card key={step.title}>
                <CardHeader>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{step.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {stats.kind === "ok" && stats.data.active.length > 0 ? (
          <div className={tableFrameClassName}>
            <table className={tableClassName}>
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Active project</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Gate</th>
                  <th className="px-4 py-3 font-medium">This gate</th>
                  <TableActionsHeader />
                </tr>
              </thead>
              <tbody>
                {stats.data.active.map((project) => {
                  const guide = gateGuide(project.currentGate);
                  return (
                    <tr key={project.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">
                        <Link
                          href={`/projects/${project.id}`}
                          className={linkClassName("table")}
                        >
                          {project.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        <Link
                          href={`/clients/${project.clientId}`}
                          className={linkClassName("table")}
                        >
                          {project.clientName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{guide.label}</td>
                      <td className="px-4 py-3 text-gray-600">{guide.youDo}</td>
                      <TableActionsCell>
                        <EditLink href={`/projects/${project.id}`} />
                        <form action={deleteProjectAction}>
                          <input type="hidden" name="id" value={project.id} />
                          <input type="hidden" name="next" value="/" />
                          <ConfirmDelete
                            label="Remove"
                            confirmValue={project.title}
                            message={`Deletes “${project.title}” and everything on it. Type the title to confirm.`}
                          />
                        </form>
                      </TableActionsCell>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        {stats.kind === "ok" ? (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Journal</CardTitle>
                <Link
                  href="/log"
                  className={linkClassName("back")}
                >
                  Open journal
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-gray-600">
                Personal work that is not a client job.
              </p>
              <ActivityForm next="/" />
              <ActivityList entries={stats.data.recentLog} next="/" />
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-6 text-sm text-gray-600">
              Copy into WhatsApp or email. Fill the brackets before you send.
            </p>
            <CopyTemplates templates={deskCopyTemplates()} />
          </CardContent>
        </Card>

        {stats.kind === "missing" || stats.kind === "error" ? (
          <DatabaseNotice kind={stats.kind} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Desk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-gray-700">
              <p>
                {stats.data.clientCount} client
                {stats.data.clientCount === 1 ? "" : "s"},{" "}
                {stats.data.projectCount} project
                {stats.data.projectCount === 1 ? "" : "s"}.
              </p>
              <p className="text-sm text-gray-500">
                {stats.data.operatorName
                  ? `Operator: ${stats.data.operatorName}.`
                  : "Database connected. Seed the operator next."}
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                {stats.data.clientCount === 0 ? (
                  <Link href="/clients/new" className={buttonClassName()}>
                    Add client
                  </Link>
                ) : (
                  <Link href="/projects/new" className={buttonClassName()}>
                    Add project
                  </Link>
                )}
                <Link href="/projects" className={buttonClassName("outline")}>
                  Open projects
                </Link>
                <Link href="/products" className={buttonClassName("outline")}>
                  Products
                </Link>
                <Link href="/export" className={buttonClassName("outline")}>
                  Export
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
    </DeskShell>
  );
}
