import Link from "next/link";
import type { Metadata } from "next";
import { PageSpread } from "@/components/page-spread";
import { PortalShell } from "@/components/portal-shell";
import { ProfileYouView } from "@/components/profile-you-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePortalPerson } from "@/lib/current-person";
import { personRoleLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { personAvatarSrcOrNull } from "@/lib/person-avatar";
import { displayText } from "@/lib/text";
import { QueryNotice } from "@/components/query-notice";
import { PortalPhotoForm } from "./photo-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Profile",
};

type PortalProfilePageProps = {
  searchParams: Promise<{ notice?: string | string[] }>;
};

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  const text = value?.trim() ?? "";
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-700">
        {label}
      </p>
      <p className={text ? "mt-2 text-dark-950" : "mt-2 text-gray-400"}>
        {displayText(value)}
      </p>
    </div>
  );
}

export default async function PortalProfilePage({
  searchParams,
}: PortalProfilePageProps) {
  const { person, client } = await requirePortalPerson();
  const query = await searchParams;
  const noticeRaw = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const notice = noticeRaw === "photo" ? "Photo updated." : null;

  return (
    <PortalShell>
      <PageSpread
        splitFrom="md"
        intro={
          <>
            <h1 className="section-heading">Profile</h1>
            <p className="mt-2 text-gray-700">
              How you appear on this portal. Organisation and people live on{" "}
              <Link href="/organisation" className={linkClassName("inline")}>
                Organisation
              </Link>
              .
            </p>
            {notice ? <QueryNotice message={notice} /> : null}
          </>
        }
        rail={
          <Card>
            <CardHeader>
              <CardTitle>You</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
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
              <PortalPhotoForm />
            </CardContent>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <Detail
              label="Decision-maker"
              value={person.isDecisionMaker ? "Yes" : null}
            />
            <Detail label="Hiring party" value={client.name} />
          </CardContent>
        </Card>
      </PageSpread>
    </PortalShell>
  );
}
