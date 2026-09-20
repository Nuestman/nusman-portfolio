"use client";

import { useActionState } from "react";
import { replyPortalMessageAction } from "@/app/portal-desk/actions";
import { FormError } from "@/components/form-error";
import { MessageComposer } from "@/components/messages/message-composer";
import { cn } from "@/lib/utils";

const initialReply = { error: null as string | null };

export function DeskMessageReplyForm({ projectId }: { projectId: string }) {
  const [replyState, replyAction, replyPending] = useActionState(
    replyPortalMessageAction,
    initialReply,
  );

  const sendButton = (
    <button
      type="submit"
      disabled={replyPending}
      className={cn(
        "mb-0.5 inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-dark-950 px-4 text-sm font-medium text-white transition-colors",
        "hover:bg-dark-800 disabled:pointer-events-none disabled:opacity-50",
      )}
    >
      {replyPending ? "…" : "Send"}
    </button>
  );

  return (
    <form
      action={replyAction}
      className="mx-auto mb-5 w-[min(32rem,calc(100%-3rem))] shrink-0 sm:w-[min(32rem,calc(100%-4rem))]"
    >
      <input type="hidden" name="projectId" value={projectId} />
      <MessageComposer
        id="desk-message-reply"
        variant="compact"
        required
        autofocus
        submitOnEnter
        disabled={replyPending}
        placeholder="Write a message…"
        actions={sendButton}
        hint={
          <p className="px-1 text-[11px] text-gray-400">
            Plain: Enter to send · Shift+Enter for a new line. Rich: ☐ checklist,
            ☑ toggle checked · headings, quote, code, table.
          </p>
        }
      />
      <FormError>{replyState.error}</FormError>
    </form>
  );
}
