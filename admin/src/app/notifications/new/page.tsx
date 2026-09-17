import { listClients, listPortalEnabledPeople } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { DeskNotificationForm } from "../notification-form";

export const dynamic = "force-dynamic";

export default async function NewNotificationPage() {
  const clients = await listClients();
  const portalPeopleNested = await Promise.all(
    clients.map(async (client) => {
      const people = await listPortalEnabledPeople(client.id);
      return people.map((person) => ({
        id: person.id,
        name: person.name,
        clientId: person.clientId,
        clientName: client.name,
      }));
    }),
  );
  const portalPeople = portalPeopleNested.flat();

  return (
    <DeskShell>
      <div className="mb-8">
        <h1 className="section-heading">New notice</h1>
        <p className="mt-2 max-w-2xl text-gray-700">
          Post an in-app notice to Desk operators or portal people. This does not
          send email by itself.
        </p>
      </div>
      <DeskNotificationForm
        people={portalPeople}
        clients={clients.map((client) => ({
          id: client.id,
          name: client.name,
        }))}
      />
    </DeskShell>
  );
}
