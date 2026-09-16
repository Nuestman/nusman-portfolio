import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonClassName } from "@/components/ui/button";
import {
  ConversationList,
  type ConversationListItem,
} from "@/components/messages/conversation-list";

export function MessagesWorkspace({
  conversations,
  activeProjectId,
  children,
  showListOnMobile = true,
  hrefBase = "/messages",
  perspective = "desk",
  composeHref,
  className,
}: {
  conversations: ConversationListItem[];
  activeProjectId?: string | null;
  children: ReactNode;
  /** When false (conversation open on small screens), hide the list. */
  showListOnMobile?: boolean;
  hrefBase?: string;
  perspective?: "desk" | "portal";
  /** Desk-only: link to start a conversation on a client project. */
  composeHref?: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[calc(100dvh-var(--desk-header-height)-3rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm",
        "h-[calc(100dvh-var(--desk-header-height)-3rem)]",
        className,
      )}
    >
      <aside
        className={cn(
          "flex w-full shrink-0 flex-col border-gray-200 md:w-[22rem] md:border-r lg:w-96",
          showListOnMobile ? "flex" : "hidden md:flex",
        )}
      >
        <div className="shrink-0 border-b border-gray-100 px-4 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="font-heading text-3xl text-dark-950">Messages</h1>
              <p className="mt-1 text-sm text-gray-500">
                {perspective === "portal"
                  ? "Threads with Usman · one per project"
                  : "Portal threads · one per project"}
              </p>
            </div>
            {composeHref ? (
              <Link
                href={composeHref}
                className={cn(buttonClassName("outline", "sm"), "shrink-0")}
              >
                New
              </Link>
            ) : null}
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ConversationList
            conversations={conversations}
            activeProjectId={activeProjectId}
            hrefBase={hrefBase}
            perspective={perspective}
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

export function MessagesEmptyPane({
  perspective = "desk",
  composeHref,
}: {
  perspective?: "desk" | "portal";
  composeHref?: string | null;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-[linear-gradient(180deg,#fafafa_0%,#f3f4f6_100%)] px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
        <span className="font-heading text-3xl text-gold-500" aria-hidden>
          @
        </span>
      </div>
      <p className="font-heading text-3xl text-dark-950">Pick a conversation</p>
      <p className="max-w-sm text-sm text-gray-500">
        {perspective === "portal"
          ? "Select a project thread from the list to read and write to Usman."
          : "Select a client thread from the list to read and reply."}
      </p>
      {composeHref ? (
        <Link
          href={composeHref}
          className={cn(buttonClassName("default", "default"), "mt-2")}
        >
          Start a new conversation
        </Link>
      ) : null}
    </div>
  );
}
