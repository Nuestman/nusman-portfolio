import { loadFromDb } from "@/db";
import {
  listClients,
  listPortalConversations,
  listProjects,
} from "@/db/queries";
import { DatabaseNotice } from "@/components/database-notice";
import { DeskShell } from "@/components/desk-shell";
import { MessagesWorkspace } from "@/components/messages/messages-workspace";
import { NewConversationForm } from "@/app/messages/new-conversation-form";

export const dynamic = "force-dynamic";

export default async function NewConversationPage() {
  const [conversations, clientsLoaded, projectsLoaded] = await Promise.all([
    loadFromDb(() => listPortalConversations()),
    loadFromDb(() => listClients()),
    loadFromDb(() => listProjects({ workKind: "client" })),
  ]);

  if (
    clientsLoaded.kind === "missing" ||
    clientsLoaded.kind === "error" ||
    projectsLoaded.kind === "missing" ||
    projectsLoaded.kind === "error"
  ) {
    const kind =
      clientsLoaded.kind === "ok" ? projectsLoaded.kind : clientsLoaded.kind;
    return (
      <DeskShell>
        <DatabaseNotice
          kind={kind === "missing" || kind === "error" ? kind : "error"}
          noun="clients"
        />
      </DeskShell>
    );
  }

  const conversationList =
    conversations.kind === "ok" ? conversations.data : [];

  return (
    <DeskShell mainClassName="space-y-0 py-4 md:py-6">
      <MessagesWorkspace
        conversations={conversationList}
        showListOnMobile={false}
        composeHref="/messages/new"
      >
        <NewConversationForm
          clients={clientsLoaded.data.map((client) => ({
            id: client.id,
            name: client.name,
          }))}
          projects={projectsLoaded.data.map((project) => ({
            id: project.id,
            title: project.title,
            clientId: project.clientId,
          }))}
        />
      </MessagesWorkspace>
    </DeskShell>
  );
}
