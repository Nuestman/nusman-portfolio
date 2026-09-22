import { loadFromDb } from "@/db";
import {
  listPortalConversations,
  unreadDeskMessageCountsByProject,
} from "@/db/queries";
import { DatabaseNotice } from "@/components/database-notice";
import { DeskShell } from "@/components/desk-shell";
import { withConversationUnread } from "@/components/messages/conversation-list";
import {
  MessagesEmptyPane,
  MessagesWorkspace,
} from "@/components/messages/messages-workspace";
import { requireSessionUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export default async function MessagesInboxPage() {
  const user = await requireSessionUser();
  const [loaded, unreadByProject] = await Promise.all([
    loadFromDb(() => listPortalConversations()),
    unreadDeskMessageCountsByProject(user.id),
  ]);

  return (
    <DeskShell mainClassName="space-y-0 py-4 md:py-6">
      {loaded.kind === "missing" || loaded.kind === "error" ? (
        <DatabaseNotice kind={loaded.kind} noun="messages" />
      ) : (
        <MessagesWorkspace
          conversations={withConversationUnread(
            loaded.data,
            unreadByProject,
          )}
          showListOnMobile
          composeHref="/messages/new"
        >
          <MessagesEmptyPane composeHref="/messages/new" />
        </MessagesWorkspace>
      )}
    </DeskShell>
  );
}
