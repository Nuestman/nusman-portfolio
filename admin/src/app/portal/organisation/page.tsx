import type { Metadata } from "next";
import Link from "next/link";
import { listPeople, listPortalProjectsForClient } from "@/db/queries";
import { PageSpread } from "@/components/page-spread";
import { PortalShell } from "@/components/portal-shell";
import { QueryNotice } from "@/components/query-notice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { InactiveBadge } from "@/components/inactive-badge";
import { requirePortalPerson } from "@/lib/current-person";
import { gateGuide } from "@/lib/gates";
import { projectStatusLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { inactiveRowProps, tableClassName, TableFrame } from "@/lib/tables";
import { PortalOrganisationCard } from "./organisation-card";
import { PortalPeopleCard } from "./people-card";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Organisation",
};

type PortalOrganisationPageProps = {
  searchParams: Promise<{ notice?: string | string[] }>;
};

export default async function PortalOrganisationPage({
  searchParams,
}: PortalOrganisationPageProps) {
  const { client } = await requirePortalPerson();
  const [people, projects, query] = await Promise.all([
    listPeople(client.id),
    listPortalProjectsForClient(client.id),
    searchParams,
  ]);

  const noticeRaw = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const notice =
    noticeRaw === "saved"
      ? "Organisation saved."
      : noticeRaw === "person-requested"
        ? "Person requested. Usman will confirm email and enable Portal."
        : null;

  return (
    <PortalShell>
      <PageSpread
        intro={
          <>
            <h1 className="section-heading">Organisation</h1>
            <p className="mt-2 text-gray-700">
              Your hiring party, people on the account, and projects. Edits save
              immediately; new people need Usman’s approval before Portal access.
            </p>
          </>
        }
      >
        <QueryNotice message={notice} />
        <PortalOrganisationCard client={client} />
        <PortalPeopleCard
          people={people.map((row) => ({
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            role: row.role,
            portalEnabled: row.portalEnabled,
            portalRequestedAt: row.portalRequestedAt,
            emailVerifiedAt: row.emailVerifiedAt,
          }))}
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <CardTitle>Projects</CardTitle>
            <Link
              href="/projects/new"
              className={buttonClassName("outline", "sm")}
            >
              Start a project
            </Link>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-gray-600">
                No hiring projects yet.{" "}
                <Link href="/projects/new" className={linkClassName("inline")}>
                  Start one
                </Link>{" "}
                when you have something new to build.
              </p>
            ) : (
              <TableFrame>
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
                          {gateGuide(project.currentGate).publicStep}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {projectStatusLabel(project.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableFrame>
            )}
          </CardContent>
        </Card>
      </PageSpread>
    </PortalShell>
  );
}
