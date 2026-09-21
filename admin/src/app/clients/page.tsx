import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { loadFromDb } from "@/db";
import { listClients } from "@/db/queries";
import { buttonClassName } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDelete } from "@/components/confirm-submit";
import { DatabaseNotice } from "@/components/database-notice";
import { DeskShell } from "@/components/desk-shell";
import {
  EditLink,
  TableActionsCell,
  TableActionsHeader,
} from "@/components/table-actions";
import { clientSourceLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { InactiveBadge } from "@/components/inactive-badge";
import {
  inactiveRowProps,
  tableClassName,
  TableFrame,
} from "@/lib/tables";
import { deleteClientAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const email = await getSessionEmail();
  const loaded = await loadFromDb(() => listClients());

  return (
    <DeskShell email={email}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-heading">Clients</h1>
          <p className="mt-2 max-w-2xl text-gray-700">
            CRM — who is hiring, who you talk to, and who can use Portal. Jobs
            live under Projects.
          </p>
        </div>
        <Link href="/clients/new" className={buttonClassName()}>
          Add client
        </Link>
      </div>

      {loaded.kind === "missing" || loaded.kind === "error" ? (
        <DatabaseNotice kind={loaded.kind} noun="clients" />
      ) : loaded.data.length === 0 ? (
        <Card>
          <CardContent className="space-y-4 pt-6 text-gray-700">
            <p>No clients yet. Add the hiring party before you start building.</p>
            <Link href="/clients/new" className={buttonClassName()}>
              Add client
            </Link>
          </CardContent>
        </Card>
      ) : (
        <TableFrame>
          <table className={tableClassName}>
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Organisation</th>
                <th className="px-4 py-3 font-medium">People</th>
                <th className="px-4 py-3 font-medium">Projects</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">
                  Email
                </th>
                <TableActionsHeader />
              </tr>
            </thead>
            <tbody>
              {loaded.data.map((client) => {
                const inactive = Number(client.inactiveProjectCount) > 0;
                return (
                <tr
                  key={client.id}
                  className="border-t border-gray-100"
                  {...inactiveRowProps(inactive)}
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex flex-wrap items-center gap-2">
                      <Link
                        href={`/clients/${client.id}`}
                        className={linkClassName("table")}
                      >
                        {client.name}
                      </Link>
                      {inactive ? <InactiveBadge /> : null}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {client.organisation ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {Number(client.personCount)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {Number(client.projectCount)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {client.source ? clientSourceLabel(client.source) : "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-700 sm:table-cell">
                    {client.email ?? "—"}
                  </td>
                  <TableActionsCell>
                    <EditLink href={`/clients/${client.id}`} />
                    {Number(client.projectCount) > 0 ? null : (
                      <form action={deleteClientAction}>
                        <input type="hidden" name="id" value={client.id} />
                        <ConfirmDelete
                          label="Remove"
                          message={`Delete ${client.name} and their people?`}
                        />
                      </form>
                    )}
                  </TableActionsCell>
                </tr>
                );
              })}
            </tbody>
          </table>
        </TableFrame>
      )}
    </DeskShell>
  );
}
