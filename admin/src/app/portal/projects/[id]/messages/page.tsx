import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPortalProjectForPerson,
  listPortalMessages,
} from "@/db/queries";
import { PortalMessageThread } from "@/components/portal-message-thread";
import { PortalShell } from "@/components/portal-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePortalPerson } from "@/lib/current-person";
import { isUuid } from "@/lib/ids";
import { linkClassName } from "@/lib/links";
import { formatStamp } from "@/lib/text";
import { PortalMessageForm } from "../../message-form";

export const dynamic = "force-dynamic";

type PortalMessagesPageProps = {
  params: Promise<{ id: string }>;
};

export default async function PortalMessagesPage({
  params,
}: PortalMessagesPageProps) {
  const { id } = await params;
  if (!isUuid(id)) {
    notFound();
  }

  const { client } = await requirePortalPerson();
  const project = await getPortalProjectForPerson(id, client.id);
  if (!project) {
    notFound();
  }

  const messages = await listPortalMessages(project.id);
  const thread = messages.map((message) => ({
    id: message.id,
    authorKind: message.authorKind,
    authorLabel: message.authorKind === "client" ? "You" : "Usman",
    body: message.body,
    createdAtLabel: formatStamp(message.createdAt),
  }));

  return (
    <PortalShell>
      <div>
        <Link
          href={`/projects/${project.id}`}
          className={linkClassName("back")}
        >
          ← {project.title}
        </Link>
        <h1 className="mt-3 section-heading">Messages</h1>
        <p className="mt-2 text-gray-700">
          Leave a note for Usman. Replies show up here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thread</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <PortalMessageThread
            messages={thread}
            emptyLabel="No messages yet."
            perspective="portal"
          />
          <PortalMessageForm projectId={project.id} />
        </CardContent>
      </Card>
    </PortalShell>
  );
}
