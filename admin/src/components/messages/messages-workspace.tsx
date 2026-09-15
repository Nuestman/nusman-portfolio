import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  ConversationList,
  type ConversationListItem,
} from "@/components/messages/conversation-list";

export function MessagesWorkspace({
  conversations,
  activeProjectId,
  children,
  showListOnMobile = true,
}: {
  conversations: ConversationListItem[];
  activeProjectId?: string | null;
  children: ReactNode;
  /** When false (conversation open on small screens), hide the list. */
  showListOnMobile?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[calc(100dvh-var(--desk-header-height)-3rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm",
        "h-[calc(100dvh-var(--desk-header-height)-3rem)]",
      )}
    >
      <aside
        className={cn(
          "flex w-full shrink-0 flex-col border-gray-200 md:w-[22rem] md:border-r lg:w-96",
          showListOnMobile ? "flex" : "hidden md:flex",
        )}
      >
        <div className="shrink-0 border-b border-gray-100 px-4 py-4">
          <h1 className="font-heading text-3xl text-dark-950">Messages</h1>
          <p className="mt-1 text-sm text-gray-500">
            Portal threads · one per project
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            activeProjectId={activeProjectId}
          />
        </div>
      </aside>

      <section
        className={cn(
          "min-w-0 flex-1 flex-col",
          showListOnMobile ? "hidden md:flex" : "flex",
        )}
      >
        {children}
      </section>
    </div>
  );
}

export function MessagesEmptyPane() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[linear-gradient(180deg,#fafafa_0%,#f3f4f6_100%)] px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
        <span className="font-heading text-3xl text-gold-500" aria-hidden>
          @
        </span>
      </div>
      <p className="font-heading text-3xl text-dark-950">Pick a conversation</p>
      <p className="max-w-sm text-sm text-gray-500">
        Select a client thread from the list to read and reply.
      </p>
    </div>
  );
}
