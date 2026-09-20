import type { Metadata } from "next";
import { PortalShell } from "@/components/portal-shell";
import { PageSpread } from "@/components/page-spread";
import { ProfileYouView } from "@/components/profile-you-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePortalPerson } from "@/lib/current-person";
import { personRoleLabel } from "@/lib/labels";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function PortalProfilePage() {
  const { person, client } = await requirePortalPerson();

  return (
    <PortalShell>
      <PageSpread
        intro={
          <>
            <h1 className="section-heading">Profile</h1>
            <p className="mt-2 text-gray-700">
              How you appear on this portal. Ask Usman if something needs
              updating.
            </p>
          </>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>You</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileYouView
              name={person.name}
              src={null}
              role={personRoleLabel(person.role)}
              email={person.email}
              phone={person.phone}
              client={client.name}
              organisation={client.organisation}
            />
          </CardContent>
        </Card>
      </PageSpread>
    </PortalShell>
  );
}
