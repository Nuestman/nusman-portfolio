import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getClient, getPerson, listProjectsForClient } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { EditableCard } from "@/components/editable-card";
import { InactiveBadge } from "@/components/inactive-badge";
import { PageSpread } from "@/components/page-spread";
import { ProfileYouView } from "@/components/profile-you-view";
import { personAvatarSrcOrNull } from "@/lib/person-avatar";
import { ConfirmDelete } from "@/components/confirm-submit";
import {
  EditLink,
  TableActionsCell,
  TableActionsHeader,
} from "@/components/table-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { QueryNotice } from "@/components/query-notice";
import {
  isPersonEmailVerified,
  personEmailNotice,
} from "@/lib/person-email-verify";
import { PersonForm } from "@/app/clients/person-form";
import { PortalPersonControls } from "@/app/portal-desk/person-controls";
import { deleteProjectAction } from "@/app/projects/actions";
import { gateGuide } from "@/lib/gates";
import { isUuid } from "@/lib/ids";
import { personRoleLabel, projectStatusLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { inactiveRowProps, tableClassName, TableFrame } from "@/lib/tables";
import { displayText, displayYesNo } from "@/lib/text";

export const dynamic = "force-dynamic";

type PersonProfilePageProps = {
  params: Promise<{ id: string; personId: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
};

async function loadPerson(id: string, personId: string) {
  if (!isUuid(id) || !isUuid(personId)) {
    return null;
  }
  const person = await getPerson(personId);
  if (!person || person.clientId !== id) {
    return null;
  }
  const client = await getClient(id);
  if (!client) {
    return null;
  }
  return { person, client };
}

export async function generateMetadata({
  params,
}: PersonProfilePageProps): Promise<Metadata> {
  const { id, personId } = await params;
  const loaded = await loadPerson(id, personId);
  return {
    title: loaded ? `${loaded.person.name} · Desk` : "Person · Desk",
  };
}

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

export default async function PersonProfilePage({
  params,
  searchParams,
}: PersonProfilePageProps) {
  const { id, personId } = await params;
  const loaded = await loadPerson(id, personId);
  if (!loaded) {
    notFound();
  }

  const { person, client } = loaded;
  if (client.kind === "practice") {
    redirect("/products");
  }

  const [email, clientProjects, query] = await Promise.all([
    getSessionEmail(),
    listProjectsForClient(client.id),
    searchParams,
  ]);
  const noticeRaw = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const emailNotice = personEmailNotice(noticeRaw);
  const emailVerified = isPersonEmailVerified(person);
  const notes = person.notes?.trim() ?? "";
  const orgEmail = client.email?.trim() ?? "";
  const orgPhone = client.phone?.trim() ?? "";
  const profilePath = `/clients/${client.id}/people/${person.id}`;

  return (
    <DeskShell email={email}>
      <PageSpread
        splitFrom="md"
        intro={
          <>
            <Link href={`/clients/${client.id}`} className={linkClassName("back")}>
              ← {client.name}
            </Link>
            <h1 className="mt-3 section-heading">Profile</h1>
            <p className="mt-2 text-gray-700">
              How they appear on Desk and Portal.
            </p>
          </>
        }
        rail={
          <EditableCard
            title="You"
            view={
              <ProfileYouView
                name={person.name}
                src={personAvatarSrcOrNull(person)}
                layout="stack"
                role={personRoleLabel(person.role)}
                email={person.email}
                phone={person.phone}
                client={client.name}
                organisation={client.organisation}
              />
            }
            form={
              <PersonForm
                submitLabel="Save person"
                person={{
                  id: person.id,
                  clientId: person.clientId,
                  name: person.name,
                  email: person.email ?? "",
                  phone: person.phone ?? "",
                  role: person.role,
                  isDecisionMaker: person.isDecisionMaker,
                  notes: person.notes ?? "",
                }}
              />
            }
          />
        }
      >
        <QueryNotice message={emailNotice} />
        {person.portalRequestedAt && !person.portalEnabled ? (
          <p className="rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-950">
            Portal access requested. Confirm email if needed, then enable Portal
            below.
          </p>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Detail
              label="Decision-maker"
              value={person.isDecisionMaker ? "Yes" : null}
            />
            <Detail label="Portal" value={displayYesNo(person.portalEnabled)} />
            <Detail
              label="Portal request"
              value={
                person.portalRequestedAt && !person.portalEnabled
                  ? "Waiting — confirm email, then enable Portal"
                  : null
              }
            />
            <Detail
              label="Email confirmed"
              value={
                emailVerified ? "Yes" : person.email?.trim() ? "No" : null
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
            <CardTitle>Organisation</CardTitle>
            <Link
              href={`/clients/${client.id}`}
              className={buttonClassName("outline", "sm")}
            >
              Open
            </Link>
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
            <Link
              href={`/projects/new?clientId=${client.id}`}
              className={buttonClassName("outline", "sm")}
            >
              Add project
            </Link>
          </CardHeader>
          <CardContent>
            {clientProjects.length === 0 ? (
              <p className="text-sm text-gray-600">
                No hiring jobs yet for this organisation.
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
                            {item.status === "inactive" ? (
                              <InactiveBadge />
                            ) : null}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {gateGuide(item.currentGate).label}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {projectStatusLabel(item.status)}
                        </td>
                        <TableActionsCell>
                          <EditLink href={`/projects/${item.id}/edit`} />
                          <form action={deleteProjectAction}>
                            <input type="hidden" name="id" value={item.id} />
                            <input
                              type="hidden"
                              name="next"
                              value={profilePath}
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
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={
                notes
                  ? "whitespace-pre-wrap text-gray-700"
                  : "text-gray-400"
              }
            >
              {displayText(person.notes)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portal access</CardTitle>
          </CardHeader>
          <CardContent>
            <PortalPersonControls
              person={{
                id: person.id,
                clientId: person.clientId,
                name: person.name,
                email: person.email,
                portalEnabled: person.portalEnabled,
                emailVerified,
                portalRequested: Boolean(
                  person.portalRequestedAt && !person.portalEnabled,
                ),
              }}
              next={profilePath}
            />
          </CardContent>
        </Card>
      </PageSpread>
    </DeskShell>
  );
}
