import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getClient, getPerson } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { PageSpread } from "@/components/page-spread";
import { QueryNotice } from "@/components/query-notice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isUuid } from "@/lib/ids";
import { linkClassName } from "@/lib/links";
import {
  isPersonEmailVerified,
  personEmailNotice,
} from "@/lib/person-email-verify";
import { PersonForm } from "@/app/clients/person-form";
import { PortalPersonControls } from "@/app/portal-desk/person-controls";

export const dynamic = "force-dynamic";

type EditPersonPageProps = {
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
}: EditPersonPageProps): Promise<Metadata> {
  const { id, personId } = await params;
  const loaded = await loadPerson(id, personId);
  return {
    title: loaded ? `Edit ${loaded.person.name} · Desk` : "Edit person · Desk",
  };
}

export default async function EditPersonPage({
  params,
  searchParams,
}: EditPersonPageProps) {
  const { id, personId } = await params;
  const loaded = await loadPerson(id, personId);
  if (!loaded) {
    notFound();
  }

  const { person, client } = loaded;
  if (client.kind === "practice") {
    redirect("/products");
  }

  const [email, query] = await Promise.all([getSessionEmail(), searchParams]);
  const noticeRaw = Array.isArray(query.notice) ? query.notice[0] : query.notice;
  const emailNotice = personEmailNotice(noticeRaw);
  const profileHref = `/clients/${client.id}/people/${person.id}`;

  return (
    <DeskShell email={email}>
      <PageSpread
        intro={
          <>
            <Link href={profileHref} className={linkClassName("back")}>
              ← {person.name}
            </Link>
            <h1 className="mt-3 section-heading">Edit person</h1>
          </>
        }
      >
        <QueryNotice message={emailNotice} />
        <Card>
          <CardHeader>
            <CardTitle>Person</CardTitle>
          </CardHeader>
          <CardContent>
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
                emailVerified: isPersonEmailVerified(person),
              }}
              next={`${profileHref}/edit`}
            />
          </CardContent>
        </Card>
      </PageSpread>
    </DeskShell>
  );
}
