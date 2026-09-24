import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import {
  countProjectsForClient,
  getClient,
  listPeople,
  listPendingEmailConfirmationProjects,
  listProjectsForClient,
} from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { EditableCard } from "@/components/editable-card";
import { HiringPartyView } from "@/components/hiring-party-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/confirm-submit";
import {
  EditLink,
  TableActionsCell,
  TableActionsHeader,
} from "@/components/table-actions";
import { QueryNotice } from "@/components/query-notice";
import {
  inboundEmailNotice,
  PendingEmailBanners,
} from "@/components/pending-email-banner";
import { isUuid } from "@/lib/ids";
import {
  clientSourceLabel,
  personRoleLabel,
  projectStatusLabel,
} from "@/lib/labels";
import { dailyUserRecordedWhenNeeded, gateGuide } from "@/lib/gates";
import { linkClassName } from "@/lib/links";
import { tableClassName, TableFrame, inactiveRowProps } from "@/lib/tables";
import { InactiveBadge } from "@/components/inactive-badge";
import { displayYesNo } from "@/lib/text";
import { isPersonEmailVerified } from "@/lib/person-email-verify";
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

  const [email, people, projectCount, clientProjects, pendingEmail, query] =
    await Promise.all([
      getSessionEmail(),
      listPeople(id),
      countProjectsForClient(id),
      listProjectsForClient(id),
      listPendingEmailConfirmationProjects(id),
      searchParams,
    ]);

  const noticeRaw = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const inboundNotice = inboundEmailNotice(noticeRaw);
  const blockedByProjects =
    noticeRaw === "has-projects" || projectCount > 0;
  const missingDailyUser = !dailyUserRecordedWhenNeeded(people);
  const portalPeople = people.filter((person) => person.portalEnabled).length;

  return (
    <DeskShell email={email}>
      <div>
        <Link href="/clients" className={linkClassName("back")}>
          ← Clients
        </Link>
        <h1 className="mt-3 section-heading">{client.name}</h1>
        <p className="mt-2 max-w-2xl text-gray-700">
          Who is hiring, who you talk to, and who can use Portal. Job work stays
          on Projects.
        </p>
      </div>

      {noticeRaw === "has-projects" ? (
        <QueryNotice message="This client has a project. Finish or move that work before deleting the client." />
      ) : inboundNotice ? (
        <QueryNotice message={inboundNotice} />
      ) : null}

      <PendingEmailBanners
        rows={pendingEmail}
        next={`/clients/${client.id}`}
      />

      <EditableCard
        title="Hiring party"
        view={
          <HiringPartyView
            name={client.name}
            organisation={client.organisation}
            email={client.email}
            phone={client.phone}
            sourceLabel={
              client.source ? clientSourceLabel(client.source) : null
            }
            notes={client.notes}
          />
        }
        form={
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
        }
      />

      <EditableCard
        title="People"
        hint="Buyer, daily user, and anyone else. Open a name for their profile. Portal invite is on Edit."
        editLabel="Add"
        always={
          <div className="space-y-4">
            {missingDailyUser ? (
              <p className="rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-950">
                More than one person and no daily user — you cannot leave
                Discover until you add one.
              </p>
            ) : null}
            {people.length === 0 ? (
              <p className="text-sm text-gray-600">
                No people yet. Add the buyer (and daily user if they are
                different).
              </p>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  {people.length} people
                  {portalPeople > 0
                    ? ` · ${portalPeople} with Portal enabled`
                    : " · none on Portal yet"}
                </p>
                <TableFrame>
                  <table className={tableClassName}>
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="hidden px-4 py-3 font-medium sm:table-cell">
                          Email
                        </th>
                        <th className="px-4 py-3 font-medium">Decision</th>
                        <th className="px-4 py-3 font-medium">Portal</th>
                        <TableActionsHeader />
                      </tr>
                    </thead>
                    <tbody>
                      {people.map((person) => (
                        <tr
                          key={person.id}
                          className="border-t border-gray-100"
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/clients/${client.id}/people/${person.id}`}
                              className={linkClassName("table")}
                            >
                              {person.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {personRoleLabel(person.role)}
                          </td>
                          <td className="hidden px-4 py-3 text-gray-700 sm:table-cell">
                            <span className="inline-flex flex-wrap items-center gap-2">
                              {person.email ?? "—"}
                              {person.email && !isPersonEmailVerified(person) ? (
                                <span className="text-xs font-medium text-gold-700">
                                  Unconfirmed
                                </span>
                              ) : null}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {person.isDecisionMaker ? "Yes" : "—"}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {displayYesNo(person.portalEnabled)}
                          </td>
                          <TableActionsCell>
                            <EditLink
                              href={`/clients/${client.id}/people/${person.id}/edit`}
                            />
                            <form action={deletePersonAction}>
                              <input
                                type="hidden"
                                name="id"
                                value={person.id}
                              />
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
                </TableFrame>
              </>
            )}
          </div>
        }
        form={
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
        }
      />

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
              No hiring jobs yet. Open a project when you know what they need.
            </p>
          ) : (
            <TableFrame>
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
                    <tr
                      key={item.id}
                      className="border-t border-gray-100"
                      {...inactiveRowProps(item.status === "inactive")}
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex flex-wrap items-center gap-2">
                          <Link
                            href={`/projects/${item.id}`}
                            className={linkClassName("table")}
                          >
                            {item.title}
                          </Link>
                          {item.status === "inactive" ? <InactiveBadge /> : null}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {gateGuide(item.currentGate).label}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {projectStatusLabel(item.status)}
                      </td>
                      <TableActionsCell>
                        <EditLink href={`/projects/${item.id}?edit=brief`} />
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
            </TableFrame>
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
              This client has a project. Finish or move that work before deleting
              the client.
            </p>
          ) : (
            <>
              <p className="text-sm">
                Deletes the hiring party and their people. No projects are
                attached.
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
