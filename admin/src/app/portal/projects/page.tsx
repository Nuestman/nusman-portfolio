import Link from "next/link";
import type { Metadata } from "next";
import { listPortalProjectsForClient } from "@/db/queries";
import { PortalShell } from "@/components/portal-shell";
import { buttonClassName } from "@/components/ui/button";
import { requirePortalPerson } from "@/lib/current-person";
import { gateGuide } from "@/lib/gates";
import { projectStatusLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
};

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

      {projects.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            No hiring projects yet. Start one when you have something new to
            build, or wait if Usman already opened one for you.
          </p>
          <Link href="/projects/new" className={buttonClassName("default")}>
            Start a project
          </Link>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Link
                href={`/projects/${project.id}`}
                className="block h-full rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 hover:border-gold-400 hover:shadow-md"
              >
                <h2 className="font-heading text-2xl text-gold-500">
                  {project.title}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {gateGuide(project.currentGate).publicStep} ·{" "}
                  {projectStatusLabel(project.status)}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </PortalShell>
  );
}
