import { loadFromDb } from "@/db";
import { listPortalConversations } from "@/db/queries";
import { DatabaseNotice } from "@/components/database-notice";
import { DeskShell } from "@/components/desk-shell";
import {
  MessagesEmptyPane,
  MessagesWorkspace,
} from "@/components/messages/messages-workspace";

export const dynamic = "force-dynamic";

export default async function MessagesInboxPage() {
  const loaded = await loadFromDb(() => listPortalConversations());

  return (
    <DeskShell mainClassName="space-y-0 py-4 md:py-6">
      {loaded.kind === "missing" || loaded.kind === "error" ? (
        <DatabaseNotice kind={loaded.kind} noun="messages" />
      ) : (
        <MessagesWorkspace
          conversations={loaded.data}
          showListOnMobile
        >
          <MessagesEmptyPane />
        </MessagesWorkspace>
      )}
    </DeskShell>
  );
}
