import Link from "next/link";
import { PortalShell } from "@/components/portal-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { requirePortalPerson } from "@/lib/current-person";
import { PortalStartProjectForm } from "@/app/portal/projects/start-project-form";

export const dynamic = "force-dynamic";

export default async function PortalStartProjectPage() {
  const { person, client } = await requirePortalPerson();

  return (
    <PortalShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="section-heading">Start a project</h1>
          <p className="mt-2 max-w-xl text-gray-700">
            Same brief as the public form — Usman gets it on Desk at Qualify.
          </p>
        </div>
        <Link href="/projects" className={buttonClassName("secondary", "sm")}>
          Back to projects
        </Link>
      </div>

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
    </PortalShell>
  );
}
