import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { listClients } from "@/db/queries";
import { databaseConfigured } from "@/db";
import { DeskHeader } from "@/components/desk-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isUuid } from "@/lib/ids";
import { NewProjectForm } from "../new-project-form";

export const dynamic = "force-dynamic";

type NewProjectPageProps = {
  searchParams: Promise<{ clientId?: string | string[] }>;
};

export default async function NewProjectPage({ searchParams }: NewProjectPageProps) {
  const email = await getSessionEmail();
  const query = await searchParams;
  const clientRaw = Array.isArray(query.clientId)
    ? query.clientId[0]
    : query.clientId;
  const selectedClientId = clientRaw && isUuid(clientRaw) ? clientRaw : undefined;
  const clients = databaseConfigured() ? await listClients() : [];

  return (
    <div className="min-h-full">
      <DeskHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div>
          <Link
            href="/projects"
            className="text-sm text-dark-950 hover:text-gold-500"
          >
            ← Projects
          </Link>
          <h1 className="mt-3 font-heading text-3xl text-dark-950 md:text-4xl">
            Add project
          </h1>
          <p className="mt-2 text-gray-700">
            Starts at Qualify. Name the client first.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Project</CardTitle>
          </CardHeader>
          <CardContent>
            {clients.length === 0 ? (
              <p className="text-sm text-gray-700">
                Add a client before you open a project.{" "}
                <Link href="/clients/new" className="text-gold-500 hover:text-gold-600">
                  Add client
                </Link>
              </p>
            ) : (
              <NewProjectForm
                clients={clients.map((client) => ({
                  id: client.id,
                  name: client.name,
                }))}
                selectedClientId={selectedClientId}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
