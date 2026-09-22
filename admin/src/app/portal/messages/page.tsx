import type { Metadata } from "next";
import {
  listPortalConversationsForClient,
  unreadPortalMessageCountsByProject,
} from "@/db/queries";
import { withConversationUnread } from "@/components/messages/conversation-list";
import {
  MessagesEmptyPane,
  MessagesWorkspace,
} from "@/components/messages/messages-workspace";
import { PortalShell } from "@/components/portal-shell";
import { requirePortalPerson } from "@/lib/current-person";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages",
};

export default async function PortalMessagesInboxPage() {
  const { client, person } = await requirePortalPerson();
  const [conversations, unreadByProject] = await Promise.all([
    listPortalConversationsForClient(client.id),
    unreadPortalMessageCountsByProject(person.id),
  ]);

  return (
    <PortalShell mainClassName="space-y-0 py-4 md:py-6">
      <MessagesWorkspace
        conversations={withConversationUnread(
          conversations,
          unreadByProject,
        )}
        showListOnMobile
        perspective="portal"
        hrefBase="/messages"
      >
        <MessagesEmptyPane perspective="portal" />
      </MessagesWorkspace>
    </PortalShell>
  );
}
