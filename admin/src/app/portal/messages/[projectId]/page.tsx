import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPortalProjectForPerson,
  listAttachmentsForMessageIds,
  listPortalConversationsForClient,
  listPortalMessages,
  markPortalMessageNotificationsReadForProject,
  unreadPortalMessageCountsByProject,
} from "@/db/queries";
import { withConversationUnread } from "@/components/messages/conversation-list";
import { MessagesWorkspace } from "@/components/messages/messages-workspace";
import { PortalMessageThread } from "@/components/portal-message-thread";
import { PortalShell } from "@/components/portal-shell";
import { ScrollThreadLatest } from "@/components/scroll-thread-latest";
import { getPortalSessionPerson, requirePortalPerson } from "@/lib/current-person";
import { isUuid } from "@/lib/ids";
import { formatChatStamp, initialsFromName } from "@/lib/text";
import { PortalMessageForm } from "@/app/portal/projects/message-form";

export const dynamic = "force-dynamic";

type PortalConversationPageProps = {
  params: Promise<{ projectId: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ projectId: string }>;
}): Promise<Metadata> {
  const { projectId } = await params;
  if (!isUuid(projectId)) {
    return { title: "Messages" };
  }
  const session = await getPortalSessionPerson().catch(() => null);
  if (!session) {
    return { title: "Messages" };
  }
  const project = await getPortalProjectForPerson(
    projectId,
    session.client.id,
  ).catch(() => null);
  return {
    title: project?.title ? `${project.title} · Messages` : "Messages",
  };
}

export default async function PortalConversationPage({
  params,
}: PortalConversationPageProps) {
  const { projectId } = await params;
  if (!isUuid(projectId)) {
    notFound();
  }

  const { client, person } = await requirePortalPerson();
  const project = await getPortalProjectForPerson(projectId, client.id);
  if (!project) {
    notFound();
  }

  await markPortalMessageNotificationsReadForProject(person.id, project.id);

  const [messages, conversations, unreadByProject] = await Promise.all([
    listPortalMessages(project.id),
    listPortalConversationsForClient(client.id),
    unreadPortalMessageCountsByProject(person.id),
  ]);

  const attachmentRows = await listAttachmentsForMessageIds(
    messages.map((message) => message.id),
  );
  const attachmentsByMessage = new Map<string, typeof attachmentRows>();
  for (const row of attachmentRows) {
    const list = attachmentsByMessage.get(row.messageId) ?? [];
    list.push(row);
    attachmentsByMessage.set(row.messageId, list);
  }

  const thread = messages.map((message) => ({
    id: message.id,
    authorKind: message.authorKind,
    authorLabel: message.authorKind === "client" ? "You" : "Usman",
    body: message.body,
    createdAtLabel: formatChatStamp(message.createdAt),
    attachments: attachmentsByMessage.get(message.id) ?? [],
  }));

  return (
    <PortalShell mainClassName="space-y-0 py-4 md:py-6">
      <MessagesWorkspace
        conversations={withConversationUnread(
          conversations,
          unreadByProject,
        )}
        activeProjectId={project.id}
        showListOnMobile={false}
        perspective="portal"
        hrefBase="/messages"
      >
        <header className="shrink-0 border-b border-gray-100 px-4 py-4">
          <div className="flex items-start gap-3">
            <Link
              href="/messages"
              className="mt-1 cursor-pointer rounded-full px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 md:hidden"
            >
              ←
            </Link>
            <span
              className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dark-950 text-sm font-medium text-white"
              aria-hidden
            >
              {initialsFromName(project.title)}
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-heading text-3xl text-dark-950">
                <Link
                  href={`/projects/${project.id}`}
                  className="hover:text-gold-600"
                >
                  {project.title}
                </Link>
              </h2>
              <p className="mt-1 truncate text-sm text-gray-500">Usman</p>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gray-50">
          <PortalMessageThread
            messages={thread}
            emptyLabel="No messages yet. Send the first note to Usman."
            perspective="portal"
          />
          <div className="shrink-0 border-t border-gray-200 bg-white p-4">
            <PortalMessageForm projectId={project.id} />
          </div>
          <ScrollThreadLatest />
        </div>
      </MessagesWorkspace>
    </PortalShell>
  );
}
