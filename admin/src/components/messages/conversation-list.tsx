import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  formatChatTime,
  initialsFromName,
  snippet,
} from "@/lib/text";

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
}: {
  conversations: ConversationListItem[];
  activeProjectId?: string | null;
}) {
  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-16 text-center">
        <p className="text-sm font-medium text-dark-950">No conversations yet</p>
        <p className="text-sm text-gray-500">
          When a client messages from the portal, it shows up here.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {conversations.map((row) => {
        const active = row.projectId === activeProjectId;
        const preview =
          row.lastAuthorKind === "operator"
            ? `You: ${snippet(row.lastBody, 56)}`
            : snippet(row.lastBody, 64);
        return (
          <li key={row.projectId}>
            <Link
              href={`/messages/${row.projectId}`}
              className={cn(
                "flex gap-3 px-4 py-3 transition-colors hover:bg-gray-50",
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
                {initialsFromName(row.clientName)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium text-dark-950">
                    {row.clientName}
                  </span>
                  <span className="shrink-0 text-xs text-gray-500">
                    {formatChatTime(row.lastAt)}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-sm text-gray-600">
                  {row.projectTitle}
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
