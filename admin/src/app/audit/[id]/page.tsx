import Link from "next/link";
import { notFound } from "next/navigation";
import { getSessionEmail } from "@/lib/auth";
import { getAuditEvent } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { InfoList } from "@/components/info-list";
import { PageSpread } from "@/components/page-spread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { isUuid } from "@/lib/ids";
import { linkClassName } from "@/lib/links";
import { displayYesNo, formatStamp } from "@/lib/text";

export const dynamic = "force-dynamic";

type AuditDetailPageProps = {
  params: Promise<{ id: string }>;
};

function auditField(value: unknown): string {
  if (value == null) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "boolean") {
    return displayYesNo(value);
  }
  if (typeof value === "number") {
    return String(value);
  }
  return JSON.stringify(value, null, 2);
}

function isFlatRecord(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  return Object.values(value).every(
    (item) =>
      item == null ||
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean",
  );
}

function AuditValue({ value }: { value: unknown }) {
  if (value == null) {
    return <p className="text-sm text-gray-600">None</p>;
  }
  if (isFlatRecord(value)) {
    const items = Object.entries(value).map(([label, item]) => ({
      label,
      value: auditField(item),
    }));
    if (items.length === 0) {
      return <p className="text-sm text-gray-600">Empty</p>;
    }
    return <InfoList items={items} />;
  }
  return (
    <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-gray-200 p-4 text-sm text-gray-700">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export default async function AuditDetailPage({ params }: AuditDetailPageProps) {
  const { id } = await params;
  if (!isUuid(id)) {
    notFound();
  }

  const [email, event] = await Promise.all([
    getSessionEmail(),
    getAuditEvent(id),
  ]);
  if (!event) {
    notFound();
  }

  return (
    <DeskShell email={email}>
      <PageSpread
        intro={
          <>
            <p>
              <Link href="/audit" className={linkClassName("back")}>
                ← Audit
              </Link>
            </p>
            <h1 className="section-heading mt-4">Audit event</h1>
            <p className="mt-2 text-gray-700">{event.summary}</p>
          </>
        }
      >

      <Card>
        <CardHeader>
          <CardTitle>What happened</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoList
            items={[
              { label: "When", value: formatStamp(event.createdAt) },
              { label: "Who", value: event.actorEmail },
              { label: "Action", value: event.action },
              { label: "Summary", value: event.summary },
              { label: "Reason", value: event.reason },
              { label: "Type", value: event.entityType },
              { label: "Record", value: event.entityId },
            ]}
          />
          {event.projectId && event.projectTitle ? (
            <p className="mt-4 text-sm">
              <span className="font-medium text-dark-950">Project: </span>
              <Link
                href={`/projects/${event.projectId}`}
                className={linkClassName()}
              >
                {event.projectTitle}
              </Link>
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Previous values</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditValue value={event.before} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>New values</CardTitle>
        </CardHeader>
        <CardContent>
          <AuditValue value={event.after} />
        </CardContent>
      </Card>
      </PageSpread>
    </DeskShell>
  );
}
