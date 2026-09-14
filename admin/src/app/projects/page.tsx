import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { databaseConfigured } from "@/db";
import { listProjects } from "@/db/queries";
import { DeskHeader } from "@/components/desk-header";
import { Card, CardContent } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { GATE_GUIDES, gateGuide, isProjectGate } from "@/lib/gates";
import { isProjectStatus, projectStatusLabel } from "@/lib/labels";
import { PROJECT_STATUSES } from "@/db/schema";
import { cn } from "@/lib/utils";
import type { ProjectGate, ProjectStatus } from "@/db/schema";

export const dynamic = "force-dynamic";

type ProjectsPageProps = {
  searchParams: Promise<{ gate?: string | string[]; status?: string | string[] }>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const email = await getSessionEmail();
  const query = await searchParams;
  const gateRaw = firstParam(query.gate);
  const statusRaw = firstParam(query.status);
  const gate = gateRaw && isProjectGate(gateRaw) ? gateRaw : undefined;
  const status =
    statusRaw && isProjectStatus(statusRaw) ? statusRaw : undefined;

  const ready = databaseConfigured();
  let rows: Awaited<ReturnType<typeof listProjects>> = [];
  let loadError = false;
  if (ready) {
    try {
      rows = await listProjects({ gate, status });
    } catch (error) {
      console.error("Desk project list failed", error);
      loadError = true;
    }
  }

  function hrefFor(patch: {
    gate?: ProjectGate | null;
    status?: ProjectStatus | null;
  }) {
    const nextGate = "gate" in patch ? patch.gate : gate;
    const nextStatus = "status" in patch ? patch.status : status;
    const params = new URLSearchParams();
    if (nextGate) {
      params.set("gate", nextGate);
    }
    if (nextStatus) {
      params.set("status", nextStatus);
    }
    const qs = params.toString();
    return qs ? `/projects?${qs}` : "/projects";
  }

  return (
    <div className="min-h-full">
      <DeskHeader email={email} />
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl text-dark-950 md:text-4xl">
              Projects
            </h1>
            <p className="mt-2 max-w-2xl text-gray-700">
              One client, one problem sentence, seven gates.
            </p>
          </div>
          <Link href="/projects/new" className={buttonClassName()}>
            Add project
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={hrefFor({ gate: null })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              !gate
                ? "border-gold-500 bg-gold-500 text-white"
                : "border-gray-200 bg-white text-dark-950 hover:border-gold-500",
            )}
          >
            All gates
          </Link>
          {GATE_GUIDES.map((item) => (
            <Link
              key={item.id}
              href={hrefFor({ gate: item.id })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm",
                gate === item.id
                  ? "border-gold-500 bg-gold-500 text-white"
                  : "border-gray-200 bg-white text-dark-950 hover:border-gold-500",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={hrefFor({ status: null })}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm",
              !status
                ? "border-gold-500 bg-gold-500 text-white"
                : "border-gray-200 bg-white text-dark-950 hover:border-gold-500",
            )}
          >
            All statuses
          </Link>
          {PROJECT_STATUSES.map((item) => (
            <Link
              key={item}
              href={hrefFor({ status: item })}
              className={cn(
                "rounded-full border px-3 py-1.5 text-sm",
                status === item
                  ? "border-gold-500 bg-gold-500 text-white"
                  : "border-gray-200 bg-white text-dark-950 hover:border-gold-500",
              )}
            >
              {projectStatusLabel(item)}
            </Link>
          ))}
        </div>

        {!ready ? (
          <Card>
            <CardContent className="pt-6 text-gray-700">
              Neon is not linked in this environment yet.
            </CardContent>
          </Card>
        ) : loadError ? (
          <Card>
            <CardContent className="pt-6 text-gray-700">
              Could not read projects. Check DATABASE_URL.
            </CardContent>
          </Card>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="pt-6 space-y-4 text-gray-700">
              <p>No projects in this filter. Add one after the client exists.</p>
              <Link href="/projects/new" className={buttonClassName()}>
                Add project
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Gate</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((project) => (
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
                      <Link
                        href={`/clients/${project.clientId}`}
                        className="hover:text-gold-500"
                      >
                        {project.clientName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {gateGuide(project.currentGate).label}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {projectStatusLabel(project.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
