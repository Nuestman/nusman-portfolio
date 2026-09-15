import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import {
  countProjectsForClient,
  getClient,
  listPeople,
  listProjectsForClient,
} from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/confirm-submit";
import {
  EditLink,
  TableActionsCell,
  TableActionsHeader,
} from "@/components/table-actions";
import { QueryNotice } from "@/components/query-notice";
import { isUuid } from "@/lib/ids";
import { personRoleLabel, projectStatusLabel } from "@/lib/labels";
import { dailyUserRecordedWhenNeeded, gateGuide } from "@/lib/gates";
import { linkClassName } from "@/lib/links";
import { tableClassName, tableFrameClassName } from "@/lib/tables";
import { ClientForm } from "../client-form";
import { PersonForm } from "../person-form";
import { deleteClientAction, deletePersonAction } from "../actions";
import { deleteProjectAction } from "@/app/projects/actions";

export const dynamic = "force-dynamic";

type ClientDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
};

export default async function ClientDetailPage({
  params,
  searchParams,
}: ClientDetailPageProps) {
  const { id } = await params;
  if (!isUuid(id)) {
    notFound();
  }

  const client = await getClient(id);
  if (!client) {
    notFound();
  }
  if (client.kind === "practice") {
    redirect("/products");
  }

  const [email, people, projectCount, clientProjects, query] = await Promise.all([
    getSessionEmail(),
    listPeople(id),
    countProjectsForClient(id),
    listProjectsForClient(id),
    searchParams,
  ]);

  const noticeRaw = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const blockedByProjects =
    noticeRaw === "has-projects" || projectCount > 0;
  const missingDailyUser = !dailyUserRecordedWhenNeeded(people);

  return (
    <DeskShell email={email} width="3xl">
        <div>
          <Link
            href="/clients"
            className={linkClassName("back")}
          >
            ← Clients
          </Link>
          <h1 className="mt-3 section-heading">
            {client.name}
          </h1>
          <p className="mt-2 text-gray-700">
            People, then a project with a problem sentence. Nothing starts from a
            chat message.
          </p>
        </div>

        {noticeRaw === "has-projects" ? (
          <QueryNotice message="This client has a project. Finish or move that work before deleting the client." />
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientForm
              submitLabel="Save changes"
              client={{
                id: client.id,
                name: client.name,
                email: client.email ?? "",
                phone: client.phone ?? "",
                organisation: client.organisation ?? "",
                source: client.source ?? "",
                notes: client.notes ?? "",
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>People</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {missingDailyUser ? (
              <p className="rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-950">
                This client has more than one person and no daily user. You
                cannot leave Discover until you add one.
              </p>
            ) : null}
            {people.length === 0 ? (
              <p className="text-sm text-gray-600">
                No people yet. If the daily user is not the buyer, add both.
              </p>
            ) : (
              <div className={tableFrameClassName}>
                <table className={tableClassName}>
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">
                        Email
                      </th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">
                        Phone
                      </th>
                      <th className="px-4 py-3 font-medium">Decision</th>
                      <TableActionsHeader />
                    </tr>
                  </thead>
                  <tbody>
                    {people.map((person) => (
                      <tr key={person.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <Link
                            href={`/clients/${client.id}/people/${person.id}/edit`}
                            className={linkClassName("table")}
                          >
                            {person.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {personRoleLabel(person.role)}
                        </td>
                        <td className="hidden px-4 py-3 text-gray-700 sm:table-cell">
                          {person.email ?? "—"}
                        </td>
                        <td className="hidden px-4 py-3 text-gray-700 md:table-cell">
                          {person.phone ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {person.isDecisionMaker ? "Yes" : "—"}
                        </td>
                        <TableActionsCell>
                          <EditLink
                            href={`/clients/${client.id}/people/${person.id}/edit`}
                          />
                          <form action={deletePersonAction}>
                            <input type="hidden" name="id" value={person.id} />
                            <input
                              type="hidden"
                              name="clientId"
                              value={client.id}
                            />
                            <ConfirmDelete
                              label="Remove"
                              message={`Remove ${person.name}?`}
                            />
                          </form>
                        </TableActionsCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div>
              <h3 className="mb-4 font-heading text-xl text-dark-950">
                Add person
              </h3>
              <PersonForm
                submitLabel="Add person"
                person={{
                  clientId: client.id,
                  name: "",
                  email: "",
                  phone: "",
                  role: "",
                  isDecisionMaker: false,
                  notes: "",
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Projects</CardTitle>
              <Link
                href={`/projects/new?clientId=${client.id}`}
                className={buttonClassName("outline", "sm")}
              >
                Add project
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {clientProjects.length === 0 ? (
              <p className="text-sm text-gray-600">
                No projects yet. Open one after you know who is hiring.
              </p>
            ) : (
              <div className={tableFrameClassName}>
                <table className={tableClassName}>
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Project</th>
                      <th className="px-4 py-3 font-medium">Gate</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <TableActionsHeader />
                    </tr>
                  </thead>
                  <tbody>
                    {clientProjects.map((item) => (
                      <tr key={item.id} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <Link
                            href={`/projects/${item.id}`}
                            className={linkClassName("table")}
                          >
                            {item.title}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {gateGuide(item.currentGate).label}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {projectStatusLabel(item.status)}
                        </td>
                        <TableActionsCell>
                          <EditLink href={`/projects/${item.id}`} />
                          <form action={deleteProjectAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <input
                              type="hidden"
                              name="next"
                              value={`/clients/${client.id}`}
                            />
                            <ConfirmDelete
                              label="Remove"
                              confirmValue={item.title}
                              message={`Deletes “${item.title}” and everything on it. Type the title to confirm.`}
                            />
                          </form>
                        </TableActionsCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Remove client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            {blockedByProjects ? (
              <p className="text-sm">
                This client has a project. Finish or move that work before
                deleting the client.
              </p>
            ) : (
              <>
                <p className="text-sm">
                  Deletes the client and their people. No projects are attached.
                </p>
                <form action={deleteClientAction}>
                  <input type="hidden" name="id" value={client.id} />
                  <ConfirmDelete
                    label="Delete client"
                    size="default"
                    message={`Delete ${client.name} and their people?`}
                  />
                </form>
              </>
            )}
          </CardContent>
        </Card>
    </DeskShell>
  );
}
