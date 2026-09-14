import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { databaseConfigured } from "@/db";
import { listClients } from "@/db/queries";
import { DeskHeader } from "@/components/desk-header";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { clientSourceLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const email = await getSessionEmail();
  const ready = databaseConfigured();
  let rows: Awaited<ReturnType<typeof listClients>> = [];
  let loadError = false;

  if (ready) {
    try {
      rows = await listClients();
    } catch (error) {
      console.error("Desk client list failed", error);
      loadError = true;
    }
  }

  return (
    <div className="min-h-full">
      <DeskHeader email={email} />
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl text-dark-950 md:text-4xl">
              Clients
            </h1>
            <p className="mt-2 max-w-2xl text-gray-700">
              The hiring party — person or organisation paying for the work.
            </p>
          </div>
          <Link href="/clients/new" className={buttonClassName()}>
            Add client
          </Link>
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
              Could not read clients. Check DATABASE_URL and that migrations have
              been applied.
            </CardContent>
          </Card>
        ) : rows.length === 0 ? (
          <Card>
            <CardContent className="pt-6 space-y-4 text-gray-700">
              <p>No clients yet. Add the hiring party before you start building.</p>
              <Link href="/clients/new" className={buttonClassName()}>
                Add client
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Organisation</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((client) => (
                  <tr key={client.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">
                      <Link
                        href={`/clients/${client.id}`}
                        className="font-medium text-dark-950 hover:text-gold-500"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {client.organisation ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {client.source ? clientSourceLabel(client.source) : "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {client.email ?? "—"}
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
