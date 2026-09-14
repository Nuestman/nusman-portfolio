import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { databaseConfigured } from "@/db";
import {
  countClients,
  countProjects,
  getOperator,
  listActiveProjects,
} from "@/db/queries";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeskHeader } from "@/components/desk-header";
import { gateGuide } from "@/lib/gates";
import { deskCopyTemplates } from "@/lib/templates";
import { CopyTemplates } from "@/app/projects/copy-templates";

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

type DeskStats =
  | { kind: "missing" }
  | {
      kind: "ok";
      projectCount: number;
      clientCount: number;
      operatorName: string | null;
      active: Awaited<ReturnType<typeof listActiveProjects>>;
    }
  | { kind: "error" };

async function loadDeskStats(): Promise<DeskStats> {
  if (!databaseConfigured()) {
    return { kind: "missing" };
  }

  try {
    const [projectCount, clientCount, operator, active] = await Promise.all([
      countProjects(),
      countClients(),
      getOperator(),
      listActiveProjects(),
    ]);
    return {
      kind: "ok",
      projectCount,
      clientCount,
      operatorName: operator?.name ?? null,
      active,
    };
  } catch (error) {
    console.error("Desk database query failed", error);
    return { kind: "error" };
  }
}

export default async function HomePage() {
  const email = await getSessionEmail();
  const stats = await loadDeskStats();

  return (
    <div className="min-h-full">
      <DeskHeader email={email} />
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <div>
          <h1 className="font-heading text-3xl text-dark-950 md:text-4xl">Today</h1>
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

        {stats.kind === "ok" && stats.active.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Active project</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Gate</th>
                  <th className="px-4 py-3 font-medium">This gate</th>
                </tr>
              </thead>
              <tbody>
                {stats.active.map((project) => {
                  const guide = gateGuide(project.currentGate);
                  return (
                    <tr key={project.id} className="border-t border-gray-100">
                      <td className="px-4 py-3">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-medium text-dark-950 hover:text-gold-500"
                        >
                          {project.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {project.clientName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{guide.label}</td>
                      <td className="px-4 py-3 text-gray-600">{guide.youDo}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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

        <Card>
          <CardHeader>
            <CardTitle>Desk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-gray-700">
            {stats.kind === "missing" ? (
              <>
                <p>Neon is not linked in this environment yet.</p>
                <p className="text-sm text-gray-500">
                  Set DATABASE_URL for this environment, then apply migrations.
                </p>
              </>
            ) : null}
            {stats.kind === "error" ? (
              <>
                <p>Could not read the database.</p>
                <p className="text-sm text-gray-500">
                  Check DATABASE_URL and that the first migration has been applied.
                </p>
              </>
            ) : null}
            {stats.kind === "ok" ? (
              <>
                <p>
                  {stats.clientCount} client{stats.clientCount === 1 ? "" : "s"},{" "}
                  {stats.projectCount} project
                  {stats.projectCount === 1 ? "" : "s"}.
                </p>
                <p className="text-sm text-gray-500">
                  {stats.operatorName
                    ? `Operator: ${stats.operatorName}.`
                    : "Database connected. Seed the operator next."}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  {stats.clientCount === 0 ? (
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
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
