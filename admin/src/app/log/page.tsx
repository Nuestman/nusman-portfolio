import { getSessionEmail } from "@/lib/auth";
import { loadFromDb } from "@/db";
import { listActivities } from "@/db/queries";
import { DatabaseNotice } from "@/components/database-notice";
import { DeskShell } from "@/components/desk-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityForm } from "./activity-form";
import { ActivityList } from "./activity-list";

export const dynamic = "force-dynamic";

export default async function LogPage() {
  const email = await getSessionEmail();
  const loaded = await loadFromDb(() => listActivities());

  return (
    <DeskShell email={email} width="3xl">
        <div>
          <h1 className="section-heading">
            Journal
          </h1>
          <p className="mt-2 text-gray-700">
            Personal work that is not a client job. Project notes stay on the
            project.
          </p>
        </div>
        {loaded.kind === "missing" || loaded.kind === "error" ? (
          <DatabaseNotice kind={loaded.kind} noun="the journal" />
        ) : (
        <Card>
          <CardHeader>
            <CardTitle>Today and earlier</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ActivityForm next="/log" />
            <ActivityList entries={loaded.data} next="/log" />
          </CardContent>
        </Card>
        )}
    </DeskShell>
  );
}
