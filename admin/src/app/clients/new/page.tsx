import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { DeskHeader } from "@/components/desk-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClientForm } from "../client-form";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const email = await getSessionEmail();

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
            Add client
          </h1>
          <p className="mt-2 text-gray-700">
            Who is hiring. If dad is the user and a colleague is paying, the
            colleague is the client.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientForm submitLabel="Save client" />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
