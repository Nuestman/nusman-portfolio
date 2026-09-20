import Link from "next/link";
import type { Metadata } from "next";
import { PortalShell } from "@/components/portal-shell";
import { PageSpread } from "@/components/page-spread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { requirePortalPerson } from "@/lib/current-person";
import { PortalStartProjectForm } from "@/app/portal/projects/start-project-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Start a project",
};

export default async function PortalStartProjectPage() {
  const { person, client } = await requirePortalPerson();

  return (
    <PortalShell>
      <PageSpread
        intro={
          <>
            <h1 className="section-heading">Start a project</h1>
            <p className="mt-2 text-gray-700">
              Same brief as the public form — Usman gets it on Desk at Qualify.
            </p>
            <p className="mt-4">
              <Link href="/projects" className={buttonClassName("secondary", "sm")}>
                Back to projects
              </Link>
            </p>
          </>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Tell Usman what you need</CardTitle>
          </CardHeader>
          <CardContent>
            <PortalStartProjectForm
              personName={person.name}
              clientName={client.name}
              organisation={client.organisation}
            />
          </CardContent>
        </Card>
      </PageSpread>
    </PortalShell>
  );
}
