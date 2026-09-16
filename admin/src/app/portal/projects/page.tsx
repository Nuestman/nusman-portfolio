import Link from "next/link";
import { listPortalProjectsForClient } from "@/db/queries";
import { PortalShell } from "@/components/portal-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { requirePortalPerson } from "@/lib/current-person";
import { gateGuide } from "@/lib/gates";
import { projectStatusLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { tableClassName, tableFrameClassName } from "@/lib/tables";

export const dynamic = "force-dynamic";

export default async function PortalProjectsPage() {
  const { person, client } = await requirePortalPerson();
  const projects = await listPortalProjectsForClient(client.id);

  return (
    <PortalShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="section-heading">Hello, {person.name}</h1>
          <p className="mt-2 text-gray-700">
            Projects for {client.name}. Open one to see progress, discovery, and
            messages.
          </p>
        </div>
        <Link
          href="/projects/new"
          className={buttonClassName("default", "sm")}
        >
          Start a project
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                No hiring projects yet. Start one when you have something new to
                build, or wait if Usman already opened one for you.
              </p>
              <Link
                href="/projects/new"
                className={buttonClassName("default")}
              >
                Start a project
              </Link>
            </div>
          ) : (
            <div className={tableFrameClassName}>
              <table className={tableClassName}>
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Stage</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
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
        </CardContent>
      </Card>
    </PortalShell>
  );
}
