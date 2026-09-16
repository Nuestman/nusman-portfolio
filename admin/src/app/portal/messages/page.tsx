import { listPortalConversationsForClient } from "@/db/queries";
import {
  MessagesEmptyPane,
  MessagesWorkspace,
} from "@/components/messages/messages-workspace";
import { PortalShell } from "@/components/portal-shell";
import { requirePortalPerson } from "@/lib/current-person";

export const dynamic = "force-dynamic";

export default async function PortalMessagesInboxPage() {
  const { client } = await requirePortalPerson();
  const conversations = await listPortalConversationsForClient(client.id);

  return (
    <PortalShell width="6xl" mainClassName="space-y-0 py-4 md:py-6">
      <MessagesWorkspace
        conversations={conversations}
        showListOnMobile
        perspective="portal"
        hrefBase="/messages"
      >
        <MessagesEmptyPane perspective="portal" />
      </MessagesWorkspace>
    </PortalShell>
  );
}
