import Link from "next/link";
import { messageBodyPlainText } from "@/lib/message-body";
import {
  formatChatTime,
  initialsFromName,
  snippet,
} from "@/lib/text";
import { cn } from "@/lib/utils";

export type ConversationListItem = {
  projectId: string;
  projectTitle: string;
  clientId: string;
  clientName: string;
  lastAt: Date;
  lastBody: string;
  lastAuthorKind: "client" | "operator";
  messageCount: number;
};

export function ConversationList({
  conversations,
  activeProjectId,
  hrefBase = "/messages",
  perspective = "desk",
}: {
  conversations: ConversationListItem[];
  activeProjectId?: string | null;
  hrefBase?: string;
  perspective?: "desk" | "portal";
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <p className="text-sm font-medium text-dark-950">No conversations yet</p>
        <p className="text-sm text-gray-500">
          {perspective === "portal"
            ? "When you message Usman on a project, it shows up here."
            : "When a client messages from the portal, it shows up here."}
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {conversations.map((row) => {
        const active = row.projectId === activeProjectId;
        const title =
          perspective === "portal" ? row.projectTitle : row.clientName;
        const subtitle =
          perspective === "portal" ? "Usman" : row.projectTitle;
        const plainLast = messageBodyPlainText(row.lastBody) || row.lastBody;
        const preview =
          perspective === "portal"
            ? row.lastAuthorKind === "client"
              ? `You: ${snippet(plainLast, 56)}`
              : snippet(plainLast, 64)
            : row.lastAuthorKind === "operator"
              ? `You: ${snippet(plainLast, 56)}`
              : snippet(plainLast, 64);
        return (
          <li key={row.projectId}>
            <Link
              href={`${hrefBase}/${row.projectId}`}
              className={cn(
                "flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
                active && "bg-gray-100 hover:bg-gray-100",
              )}
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-medium text-white",
                  active ? "bg-gray-700" : "bg-dark-950",
                )}
                aria-hidden
              >
                {initialsFromName(title)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium text-dark-950">
                    {title}
                  </span>
                  <span className="shrink-0 text-xs text-gray-500">
                    {formatChatTime(row.lastAt)}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-sm text-gray-600">
                  {subtitle}
                </span>
                <span className="mt-0.5 block truncate text-sm text-gray-500">
                  {preview}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
