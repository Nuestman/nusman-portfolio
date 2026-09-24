import Link from "next/link";
import type { Metadata } from "next";
import { getSessionEmail } from "@/lib/auth";
import { loadFromDb } from "@/db";
import { listProjects } from "@/db/queries";
import { DatabaseNotice } from "@/components/database-notice";
import { DeskShell } from "@/components/desk-shell";
import { ConfirmDelete } from "@/components/confirm-submit";
import {
  EditLink,
  TableActionsCell,
  TableActionsHeader,
} from "@/components/table-actions";
import { Card, CardContent } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { GATE_GUIDES, gateGuide, isProjectGate } from "@/lib/gates";
import { isProjectStatus, projectStatusLabel } from "@/lib/labels";
import { PROJECT_STATUSES } from "@/db/schema";
import { linkClassName } from "@/lib/links";
import { shouldServePortalUi } from "@/lib/serve-portal";
import { dualModeMetadata } from "@/lib/surface-meta";
import { InactiveBadge } from "@/components/inactive-badge";
import {
  inactiveRowProps,
  tableClassName,
  TableFrame,
} from "@/lib/tables";
import type { ProjectGate, ProjectStatus } from "@/db/schema";
import PortalProjectsPage from "@/app/portal/projects/page";
import { deleteProjectAction } from "./actions";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dualModeMetadata("Projects");
}

type ProjectsPageProps = {
  searchParams: Promise<{ gate?: string | string[]; status?: string | string[] }>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  if (await shouldServePortalUi()) {
    return <PortalProjectsPage />;
  }

  const email = await getSessionEmail();
  const query = await searchParams;
  const gateRaw = firstParam(query.gate);
  const statusRaw = firstParam(query.status);
  const gate = gateRaw && isProjectGate(gateRaw) ? gateRaw : undefined;
  const status =
    statusRaw && isProjectStatus(statusRaw) ? statusRaw : undefined;

  const loaded = await loadFromDb(() => listProjects({ gate, status }));

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
    <DeskShell email={email}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="section-heading">
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
            className={linkClassName(gate ? "chip" : "chipActive")}
          >
            All gates
          </Link>
          {GATE_GUIDES.map((item) => (
            <Link
              key={item.id}
              href={hrefFor({ gate: item.id })}
              className={linkClassName(
                gate === item.id ? "chipActive" : "chip",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={hrefFor({ status: null })}
            className={linkClassName(status ? "chip" : "chipActive")}
          >
            All statuses
          </Link>
          {PROJECT_STATUSES.map((item) => (
            <Link
              key={item}
              href={hrefFor({ status: item })}
              className={linkClassName(
                status === item ? "chipActive" : "chip",
              )}
            >
              {projectStatusLabel(item)}
            </Link>
          ))}
        </div>

        {loaded.kind === "missing" || loaded.kind === "error" ? (
          <DatabaseNotice kind={loaded.kind} noun="projects" />
        ) : loaded.data.length === 0 ? (
          <Card>
            <CardContent className="pt-6 space-y-4 text-gray-700">
              <p>No projects in this filter. Add one after the client exists.</p>
              <Link href="/projects/new" className={buttonClassName()}>
                Add project
              </Link>
            </CardContent>
          </Card>
        ) : (
          <TableFrame>
            <table className={tableClassName}>
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Project</th>
                  <th className="px-4 py-3 font-medium">Client</th>
                  <th className="px-4 py-3 font-medium">Gate</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <TableActionsHeader />
                </tr>
              </thead>
              <tbody>
                {loaded.data.map((project) => (
                  <tr
                    key={project.id}
                    className="border-t border-gray-100"
                    {...inactiveRowProps(project.status === "inactive")}
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex flex-wrap items-center gap-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className={linkClassName("table")}
                        >
                          {project.title}
                        </Link>
                        {project.status === "inactive" ? (
                          <InactiveBadge />
                        ) : null}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <Link
                        href={`/clients/${project.clientId}`}
                        className={linkClassName("table")}
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
                    <TableActionsCell>
                      <EditLink href={`/projects/${project.id}?edit=brief`} />
                      <form action={deleteProjectAction}>
                        <input type="hidden" name="id" value={project.id} />
                        <input type="hidden" name="next" value="/projects" />
                        <ConfirmDelete
                          label="Remove"
                          confirmValue={project.title}
                          message={`Deletes “${project.title}” and everything on it. Type the title to confirm.`}
                        />
                      </form>
                    </TableActionsCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableFrame>
        )}
    </DeskShell>
  );
}
