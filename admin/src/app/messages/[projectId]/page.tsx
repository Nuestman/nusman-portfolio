import Link from "next/link";
import { notFound } from "next/navigation";
import { loadFromDb } from "@/db";
import {
  getClient,
  getProject,
  listAttachmentsForMessageIds,
  listPortalConversations,
  listPortalMessages,
  markDeskMessageNotificationsReadForProject,
  unreadDeskMessageCountsByProject,
} from "@/db/queries";
import { DatabaseNotice } from "@/components/database-notice";
import { DeskShell } from "@/components/desk-shell";
import { withConversationUnread } from "@/components/messages/conversation-list";
import { MessagesWorkspace } from "@/components/messages/messages-workspace";
import { PortalMessageThread } from "@/components/portal-message-thread";
import { ScrollThreadLatest } from "@/components/scroll-thread-latest";
import { requireSessionUser } from "@/lib/current-user";
import { isUuid } from "@/lib/ids";
import {
  formatChatStamp,
  initialsFromName,
} from "@/lib/text";
import { DeskMessageReplyForm } from "../reply-form";

export const dynamic = "force-dynamic";

type ConversationPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function DeskConversationPage({
  params,
}: ConversationPageProps) {
  const { projectId } = await params;
  if (!isUuid(projectId)) {
    notFound();
  }

  const project = await getProject(projectId);
  if (!project || project.workKind !== "client") {
    notFound();
  }

  const user = await requireSessionUser();
  await markDeskMessageNotificationsReadForProject(user.id, project.id);

  const [client, messages, conversations, unreadByProject] = await Promise.all([
    getClient(project.clientId),
    listPortalMessages(project.id),
    loadFromDb(() => listPortalConversations()),
    unreadDeskMessageCountsByProject(user.id),
  ]);
  if (!client) {
    notFound();
  }

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
    authorLabel:
      message.authorKind === "operator"
        ? "You"
        : (message.authorName?.trim() || "Client"),
    body: message.body,
    createdAtLabel: formatChatStamp(message.createdAt),
    attachments: attachmentsByMessage.get(message.id) ?? [],
  }));

  const list =
    conversations.kind === "ok"
      ? conversations.data
      : [
          {
            projectId: project.id,
            projectTitle: project.title,
            clientId: client.id,
            clientName: client.name,
            lastAt: messages.at(-1)?.createdAt ?? project.updatedAt,
            lastBody: messages.at(-1)?.body ?? "",
            lastAuthorKind: (messages.at(-1)?.authorKind ??
              "operator") as "client" | "operator",
            messageCount: messages.length,
          },
        ];

  const hasActive = list.some((row) => row.projectId === project.id);
  const conversationsForList = withConversationUnread(
    hasActive
      ? list
      : [
          {
            projectId: project.id,
            projectTitle: project.title,
            clientId: client.id,
            clientName: client.name,
            lastAt: new Date(),
            lastBody: "Start the conversation",
            lastAuthorKind: "operator" as const,
            messageCount: 0,
          },
          ...list,
        ],
    unreadByProject,
  );

  return (
    <DeskShell mainClassName="space-y-0 py-4 md:py-6">
      {conversations.kind === "missing" || conversations.kind === "error" ? (
        <DatabaseNotice kind={conversations.kind} noun="messages" />
      ) : (
        <MessagesWorkspace
          conversations={conversationsForList}
          activeProjectId={project.id}
          showListOnMobile={false}
          composeHref="/messages/new"
        >
          <header className="shrink-0 border-b border-gray-100 px-4 py-4">
            <div className="flex items-start gap-3">
              <Link
                href="/messages"
                className="mt-1 rounded-full px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 md:hidden"
              >
                ←
              </Link>
              <Link
                href={`/clients/${client.id}`}
                className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dark-950 text-sm font-medium text-white transition-opacity hover:opacity-80"
                aria-label={`${client.name} — open client`}
              >
                {initialsFromName(client.name)}
              </Link>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-heading text-3xl text-dark-950">
                  <Link
                    href={`/clients/${client.id}`}
                    className="hover:text-gold-600"
                  >
                    {client.name}
                  </Link>
                </h2>
                <p className="mt-1 truncate text-sm text-gray-500">
                  <Link
                    href={`/projects/${project.id}`}
                    className="hover:text-gray-700"
                  >
                    {project.title}
                  </Link>
                </p>
              </div>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-gray-50">
            <PortalMessageThread
              messages={thread}
              emptyLabel="Send the first message, or wait for the client to write from the portal."
              perspective="desk"
            />
            <DeskMessageReplyForm projectId={project.id} />
            <ScrollThreadLatest />
          </div>
        </MessagesWorkspace>
      )}
    </DeskShell>
  );
}
