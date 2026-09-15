import { PortalShell } from "@/components/portal-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserAvatar } from "@/components/user-avatar";
import { InfoList } from "@/components/info-list";
import { requirePortalPerson } from "@/lib/current-person";
import { displayText } from "@/lib/text";

export const dynamic = "force-dynamic";

export default async function PortalProfilePage() {
  const { person, client } = await requirePortalPerson();

  return (
    <PortalShell>
      <div>
        <h1 className="section-heading">Profile</h1>
        <p className="mt-2 text-gray-700">
          How you appear on this portal. Ask Usman if something needs updating.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>You</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full">
              <UserAvatar name={person.name} src={null} />
            </div>
            <div>
              <p className="font-heading text-3xl text-dark-950">{person.name}</p>
              <p className="text-sm text-gray-500">{client.name}</p>
            </div>
          </div>
          <InfoList
            items={[
              { label: "Email", value: displayText(person.email) },
              { label: "Phone", value: displayText(person.phone) },
              { label: "Organisation", value: displayText(client.organisation) },
            ]}
          />
        </CardContent>
      </Card>
    </PortalShell>
  );
}
