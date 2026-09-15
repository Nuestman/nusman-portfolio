import { cn } from "@/lib/utils";

export type PortalThreadMessage = {
  id: string;
  authorKind: "client" | "operator";
  authorLabel: string;
  body: string;
  createdAtLabel: string;
};

export function PortalMessageThread({
  messages,
  emptyLabel = "No messages yet.",
  perspective = "desk",
}: {
  messages: PortalThreadMessage[];
  emptyLabel?: string;
  perspective?: "desk" | "portal";
}) {
  if (messages.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-sm font-medium text-dark-950">Nothing here yet</p>
        <p className="mt-1 max-w-xs text-sm text-gray-500">{emptyLabel}</p>
      </div>
    );
  }

  const lastId = messages[messages.length - 1]?.id;

  return (
    <ul className="space-y-1.5 px-3 py-4 sm:px-5">
      {messages.map((message, index) => {
        const fromClient = message.authorKind === "client";
        const mine = perspective === "desk" ? !fromClient : fromClient;
        const prev = messages[index - 1];
        const sameAuthor = prev?.authorKind === message.authorKind;
        const showMeta = !sameAuthor;

        return (
          <li
            key={message.id}
            id={message.id === lastId ? "thread-latest" : undefined}
            className={cn(
              "flex",
              mine ? "justify-end" : "justify-start",
              showMeta && index > 0 ? "mt-3" : null,
            )}
          >
            <div
              className={cn(
                "max-w-[min(100%,28rem)] px-5 py-4 text-dark-950",
                mine
                  ? "rounded-[1.25rem] rounded-br-md bg-gray-200"
                  : "rounded-[1.25rem] rounded-bl-md bg-white ring-1 ring-gray-200",
              )}
            >
              {showMeta ? (
                <p className="mb-1 text-[11px] font-medium tracking-wide text-gray-500">
                  {message.authorLabel}
                </p>
              ) : null}
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                {message.body}
              </p>
              <p className="mt-1 text-right text-[10px] tabular-nums text-gray-500">
                {message.createdAtLabel}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
