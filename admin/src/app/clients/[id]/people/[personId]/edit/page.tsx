import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getClient, getPerson } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isUuid } from "@/lib/ids";
import { linkClassName } from "@/lib/links";
import { PersonForm } from "@/app/clients/person-form";

export const dynamic = "force-dynamic";

type EditPersonPageProps = {
  params: Promise<{ id: string; personId: string }>;
};

export default async function EditPersonPage({ params }: EditPersonPageProps) {
  const { id, personId } = await params;
  if (!isUuid(id) || !isUuid(personId)) {
    notFound();
  }

  const person = await getPerson(personId);
  if (!person || person.clientId !== id) {
    notFound();
  }

  const client = await getClient(id);
  if (!client || client.kind === "practice") {
    redirect("/products");
  }

  const email = await getSessionEmail();

  return (
    <DeskShell email={email} width="3xl">
        <div>
          <Link
            href={`/clients/${id}`}
            className={linkClassName("back")}
          >
            ← {person.name}
          </Link>
          <h1 className="mt-3 section-heading">
            Edit person
          </h1>
        </div>
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
    </DeskShell>
  );
}
