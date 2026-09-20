import Link from "next/link";
import type { Metadata } from "next";
import { getSessionEmail } from "@/lib/auth";
import { loadFromDb } from "@/db";
import { listClients } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { PageSpread } from "@/components/page-spread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseNotice } from "@/components/database-notice";
import { isUuid } from "@/lib/ids";
import { linkClassName } from "@/lib/links";
import { shouldServePortalUi } from "@/lib/serve-portal";
import { dualModeMetadata } from "@/lib/surface-meta";
import PortalStartProjectPage from "@/app/portal/projects/new/page";
import { NewProjectForm } from "../new-project-form";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return dualModeMetadata("Start a project");
}

type NewProjectPageProps = {
  searchParams: Promise<{ clientId?: string | string[] }>;
};

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  if (await shouldServePortalUi()) {
    return <PortalStartProjectPage />;
  }

  const email = await getSessionEmail();
  const query = await searchParams;
  const clientRaw = Array.isArray(query.clientId)
    ? query.clientId[0]
    : query.clientId;
  const selectedClientId = clientRaw && isUuid(clientRaw) ? clientRaw : undefined;
  const loaded = await loadFromDb(() => listClients());

  return (
    <DeskShell email={email}>
      <PageSpread
        intro={
          <>
            <Link href="/projects" className={linkClassName("back")}>
              ← Projects
            </Link>
            <h1 className="mt-3 section-heading">Add project</h1>
            <p className="mt-2 text-gray-700">
              Starts at Qualify. Name the client first.
            </p>
          </>
        }
      >
        {loaded.kind === "missing" || loaded.kind === "error" ? (
          <DatabaseNotice kind={loaded.kind} noun="clients" />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Project</CardTitle>
            </CardHeader>
            <CardContent>
              {loaded.data.length === 0 ? (
                <p className="text-sm text-gray-700">
                  Add a client before you open a project.{" "}
                  <Link href="/clients/new" className={linkClassName("inline")}>
                    Add client
                  </Link>
                </p>
              ) : (
                <NewProjectForm
                  clients={loaded.data.map((client) => ({
                    id: client.id,
                    name: client.name,
                  }))}
                  selectedClientId={selectedClientId}
                />
              )}
            </CardContent>
          </Card>
        )}
      </PageSpread>
    </DeskShell>
  );
}
