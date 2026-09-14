import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getPerson } from "@/db/queries";
import { DeskHeader } from "@/components/desk-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isUuid } from "@/lib/ids";
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

  const email = await getSessionEmail();

  return (
    <div className="min-h-full">
      <DeskHeader email={email} />
      <main className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <div>
          <Link
            href={`/clients/${id}`}
            className="text-sm text-dark-950 hover:text-gold-500"
          >
            ← {person.name}
          </Link>
          <h1 className="mt-3 font-heading text-3xl text-dark-950 md:text-4xl">
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
      </main>
    </div>
  );
}
