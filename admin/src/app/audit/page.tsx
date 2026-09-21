import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { loadFromDb } from "@/db";
import { listAuditEvents } from "@/db/queries";
import { DatabaseNotice } from "@/components/database-notice";
import { DeskShell } from "@/components/desk-shell";
import { PageSpread } from "@/components/page-spread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { linkClassName } from "@/lib/links";
import { tableClassName, TableFrame } from "@/lib/tables";
import { formatStamp, snippet } from "@/lib/text";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const email = await getSessionEmail();
  const loaded = await loadFromDb(() => listAuditEvents());

  return (
    <DeskShell email={email}>
      <PageSpread
        intro={
          <>
            <h1 className="section-heading">Audit</h1>
            <p className="mt-2 text-gray-700">
              What changed on Desk. Personal notes stay on Journal. Project notes
              stay on the job.
            </p>
          </>
        }
      >
      {loaded.kind === "missing" || loaded.kind === "error" ? (
        <DatabaseNotice kind={loaded.kind} noun="the audit trail" />
      ) : loaded.data.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Nothing recorded yet. Saves, deletes, gate moves, and sign-in
              will show up here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Latest 200. Click a row for previous values, new values, and any
              delete reason. This list is not edited.
            </p>
            <TableFrame>
              <table className={tableClassName}>
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Who</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Summary</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">
                      Project
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loaded.data.map((event) => (
                    <tr
                      key={event.id}
                      className="relative border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        <Link
                          href={`/audit/${event.id}`}
                          className={`${linkClassName("table")} after:absolute after:inset-0`}
                        >
                          {formatStamp(event.createdAt)}
                          <span className="sr-only">, open details</span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {event.actorEmail ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {event.action}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {snippet(event.summary, 120)}
                      </td>
                      <td className="relative z-10 hidden px-4 py-3 text-gray-700 sm:table-cell">
                        {event.projectId && event.projectTitle ? (
                          <Link
                            href={`/projects/${event.projectId}`}
                            className={linkClassName("table")}
                          >
                            {event.projectTitle}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableFrame>
          </CardContent>
        </Card>
      )}
      </PageSpread>
    </DeskShell>
  );
}
