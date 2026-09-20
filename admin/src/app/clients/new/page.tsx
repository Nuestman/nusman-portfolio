import Link from "next/link";
import { getSessionEmail } from "@/lib/auth";
import { DeskShell } from "@/components/desk-shell";
import { PageSpread } from "@/components/page-spread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { linkClassName } from "@/lib/links";
import { ClientForm } from "../client-form";

export const dynamic = "force-dynamic";

export default async function NewClientPage() {
  const email = await getSessionEmail();

  return (
    <DeskShell email={email}>
      <PageSpread
        intro={
          <>
            <Link href="/clients" className={linkClassName("back")}>
              ← Clients
            </Link>
            <h1 className="mt-3 section-heading">Add client</h1>
            <p className="mt-2 text-gray-700">
              Who is hiring. If dad is the user and a colleague is paying, the
              colleague is the client.
            </p>
          </>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientForm submitLabel="Save client" />
          </CardContent>
        </Card>
      </PageSpread>
    </DeskShell>
  );
}
