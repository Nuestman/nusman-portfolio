import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getActivity } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isUuid } from "@/lib/ids";
import { linkClassName } from "@/lib/links";
import { ActivityForm } from "@/app/log/activity-form";

export const dynamic = "force-dynamic";

type EditActivityPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditActivityPage({
  params,
}: EditActivityPageProps) {
  const { id } = await params;
  if (!isUuid(id)) {
    notFound();
  }

  const activity = await getActivity(id);
  if (!activity) {
    notFound();
  }

  const email = await getSessionEmail();

  return (
    <DeskShell email={email} width="3xl">
      <div>
        <Link href="/log" className={linkClassName("back")}>
          ← Journal
        </Link>
        <h1 className="mt-3 section-heading">Edit line</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Line</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityForm
            next="/log"
            activity={{ id: activity.id, body: activity.body }}
            submitLabel="Save line"
          />
        </CardContent>
      </Card>
    </DeskShell>
  );
}
