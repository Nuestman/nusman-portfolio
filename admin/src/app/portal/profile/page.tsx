import Link from "next/link";
import type { Metadata } from "next";
import { listPortalProjectsForClient } from "@/db/queries";
import { InactiveBadge } from "@/components/inactive-badge";
import { PageSpread } from "@/components/page-spread";
import { PortalShell } from "@/components/portal-shell";
import { ProfileYouView } from "@/components/profile-you-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { requirePortalPerson } from "@/lib/current-person";
import { gateGuide } from "@/lib/gates";
import { personRoleLabel, projectStatusLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { inactiveRowProps, tableClassName, TableFrame } from "@/lib/tables";
import { displayText } from "@/lib/text";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile",
};

function Detail({
  label,
  value,
  href,
}: {
  label: string;
  value: string | null | undefined;
  href?: string | null;
}) {
  const text = value?.trim() ?? "";
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-700">
        {label}
      </p>
      {text && href ? (
        <p className="mt-2 text-dark-950">
          <a href={href} className={linkClassName("inline")}>
            {text}
          </a>
        </p>
      ) : (
        <p className={text ? "mt-2 text-dark-950" : "mt-2 text-gray-400"}>
          {displayText(value)}
        </p>
      )}
    </div>
  );
}

export default async function PortalProfilePage() {
  const { person, client } = await requirePortalPerson();
  const projects = await listPortalProjectsForClient(client.id);
  const orgEmail = client.email?.trim() ?? "";
  const orgPhone = client.phone?.trim() ?? "";

  return (
    <PortalShell>
      <PageSpread
        splitFrom="md"
        intro={
          <>
            <h1 className="section-heading">Profile</h1>
            <p className="mt-2 text-gray-700">
              How you appear on this portal. Ask Usman if something needs
              updating.
            </p>
          </>
        }
        rail={
          <Card>
            <CardHeader>
              <CardTitle>You</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileYouView
                name={person.name}
                src={null}
                layout="stack"
                role={personRoleLabel(person.role)}
                email={person.email}
                phone={person.phone}
                client={client.name}
                organisation={client.organisation}
              />
            </CardContent>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Detail
              label="Decision-maker"
              value={person.isDecisionMaker ? "Yes" : null}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organisation</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Detail label="Hiring party" value={client.name} />
            <Detail label="Organisation" value={client.organisation} />
            <Detail
              label="Email"
              value={client.email}
              href={orgEmail ? `mailto:${orgEmail}` : null}
            />
            <Detail
              label="Phone"
              value={client.phone}
              href={orgPhone ? `tel:${orgPhone}` : null}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <CardTitle>Projects</CardTitle>
            <Link href="/projects/new" className={buttonClassName("outline", "sm")}>
              Start a project
            </Link>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <p className="text-sm text-gray-600">
                No hiring projects yet. Start one when you have something new to
                build, or wait if Usman already opened one for you.
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
