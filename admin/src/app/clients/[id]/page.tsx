import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import {
  countProjectsForClient,
  getClient,
  listPeople,
  listProjectsForClient,
} from "@/db/queries";
import { DeskHeader } from "@/components/desk-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { ConfirmSubmit } from "@/components/confirm-submit";
import { isUuid } from "@/lib/ids";
import { personRoleLabel } from "@/lib/labels";
import { gateGuide } from "@/lib/gates";
import { ClientForm } from "../client-form";
import { PersonForm } from "../person-form";
import { deleteClientAction, deletePersonAction } from "../actions";

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

  const [email, people, projectCount, clientProjects, query] = await Promise.all([
    getSessionEmail(),
    listPeople(id),
    countProjectsForClient(id),
    listProjectsForClient(id),
    searchParams,
  ]);

  const noticeRaw = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const blockedByProjects = noticeRaw === "has-projects";

  return (
    <div className="min-h-full">
      <DeskHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div>
          <Link
            href="/clients"
            className="text-sm text-dark-950 hover:text-gold-500"
          >
            ← Clients
          </Link>
          <h1 className="mt-3 font-heading text-3xl text-dark-950 md:text-4xl">
            {client.name}
          </h1>
          <p className="mt-2 text-gray-700">
            People, then a project with a problem sentence. Nothing starts from a
            chat message.
          </p>
        </div>

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
              <ul className="space-y-3">
                {clientProjects.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3">
                    <Link
                      href={`/projects/${item.id}`}
                      className="font-medium text-dark-950 hover:text-gold-500"
                    >
                      {item.title}
                    </Link>
                    <span className="text-sm text-gray-500">
                      {gateGuide(item.currentGate).label}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>People</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {people.length === 0 ? (
              <p className="text-sm text-gray-600">
                No people yet. If the daily user is not the buyer, add both.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Decision</th>
                      <th className="px-4 py-3 font-medium">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {people.map((person) => (
                      <tr key={person.id} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-dark-950">{person.name}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {personRoleLabel(person.role)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {person.isDecisionMaker ? "Yes" : "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-3">
                            <Link
                              href={`/clients/${client.id}/people/${person.id}/edit`}
                              className="text-sm text-dark-950 hover:text-gold-500"
                            >
                              Edit
                            </Link>
                            <form action={deletePersonAction}>
                              <input type="hidden" name="id" value={person.id} />
                              <input
                                type="hidden"
                                name="clientId"
                                value={client.id}
                              />
                              <ConfirmSubmit
                                label="Remove"
                                message={`Remove ${person.name}?`}
                              />
                            </form>
                          </div>
                        </td>
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
            <CardTitle>Remove client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-gray-700">
            {projectCount > 0 || blockedByProjects ? (
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
                  <ConfirmSubmit
                    label="Delete client"
                    size="default"
                    message={`Delete ${client.name} and their people?`}
                  />
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
