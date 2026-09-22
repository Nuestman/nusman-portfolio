import {
  messageBodyLooksRich,
  sanitizeMessageHtml,
} from "@/lib/message-body";
import { cn } from "@/lib/utils";

export type PortalThreadAttachment = {
  id: string;
  originalFilename: string;
  contentType: string;
  byteSize: number;
};

export type PortalThreadMessage = {
  id: string;
  authorKind: "client" | "operator";
  authorLabel: string;
  body: string;
  createdAtLabel: string;
  attachments?: PortalThreadAttachment[];
};

function formatBytes(n: number): string {
  if (n < 1024) {
    return `${n} B`;
  }
  if (n < 1024 * 1024) {
    return `${(n / 1024).toFixed(1)} KB`;
  }
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function MessageBodyContent({ body }: { body: string }) {
  if (body === "(attachment)") {
    return null;
  }
  if (!messageBodyLooksRich(body)) {
    return (
      <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-[15px] leading-relaxed">
        {body}
      </p>
    );
  }

  return (
    <div
      className={cn(
        "message-rich-body break-words [overflow-wrap:anywhere] text-[15px] leading-relaxed",
        "[&_a]:break-all [&_a]:text-gold-700 [&_a]:underline",
        "[&_p]:mb-2 [&_p:last-child]:mb-0",
        "[&_h2]:mb-1.5 [&_h2]:mt-2 [&_h2]:text-base [&_h2]:font-semibold",
        "[&_h3]:mb-1 [&_h3]:mt-2 [&_h3]:text-[15px] [&_h3]:font-semibold",
        "[&_ul:not(.msg-checklist)]:mb-2 [&_ul:not(.msg-checklist)]:list-disc [&_ul:not(.msg-checklist)]:pl-5",
        "[&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li]:my-0.5",
        "[&_ul.msg-checklist]:mb-2 [&_ul.msg-checklist]:list-none [&_ul.msg-checklist]:pl-0",
        "[&_ul.msg-checklist>li]:relative [&_ul.msg-checklist>li]:my-1 [&_ul.msg-checklist>li]:pl-6",
        "[&_ul.msg-checklist>li]:before:absolute [&_ul.msg-checklist>li]:before:left-0 [&_ul.msg-checklist>li]:before:content-['☐']",
        "[&_ul.msg-checklist>li.msg-checklist--checked]:before:content-['☑']",
        "[&_blockquote]:border-l-2 [&_blockquote]:border-gray-300 [&_blockquote]:pl-3 [&_blockquote]:text-gray-700",
        "[&_code]:break-all [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em]",
        "[&_pre]:mb-2 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-black/5 [&_pre]:p-2 [&_pre]:text-[0.85em]",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0",
        "[&_table]:mb-2 [&_table]:w-full [&_table]:border-collapse [&_table]:text-[0.9em]",
        "[&_th]:border [&_th]:border-gray-200 [&_th]:bg-black/5 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold",
        "[&_td]:border [&_td]:border-gray-200 [&_td]:px-2 [&_td]:py-1",
      )}
      dangerouslySetInnerHTML={{ __html: sanitizeMessageHtml(body) }}
    />
  );
}

function MessageAttachments({
  attachments,
}: {
  attachments: PortalThreadAttachment[];
}) {
  if (attachments.length === 0) {
    return null;
  }
  return (
    <ul className="mt-2 space-y-2 border-t border-black/5 pt-2">
      {attachments.map((file) => {
        const href = `/api/files/attachment/${file.id}`;
        const isImage = file.contentType.startsWith("image/");
        return (
          <li key={file.id}>
            {isImage ? (
              <a href={href} className="block overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={href}
                  alt={file.originalFilename}
                  className="max-h-48 max-w-full object-contain"
                />
              </a>
            ) : null}
            <a
              href={href}
              className="inline-flex max-w-full flex-wrap items-baseline gap-x-2 break-all text-sm text-gold-700 underline"
            >
              <span className="min-w-0">{file.originalFilename}</span>
              <span className="text-xs text-gray-500 no-underline">
                {formatBytes(file.byteSize)}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

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
        const attachments = message.attachments ?? [];

        return (
          <li
            key={message.id}
            id={message.id === lastId ? "thread-latest" : undefined}
            className={cn(
              "flex min-w-0",
              mine ? "justify-end" : "justify-start",
              showMeta && index > 0 ? "mt-3" : null,
            )}
          >
            <div
              className={cn(
                "min-w-0 max-w-[min(100%,28rem)] px-5 py-4 text-dark-950",
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
              <MessageBodyContent body={message.body} />
              <MessageAttachments attachments={attachments} />
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
