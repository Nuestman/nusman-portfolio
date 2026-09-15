"use client";

import { useActionState, useEffect, useRef } from "react";
import { replyPortalMessageAction } from "@/app/portal-desk/actions";
import { FormError } from "@/components/form-error";
import { cn } from "@/lib/utils";

const initialReply = { error: null as string | null };

export function DeskMessageReplyForm({ projectId }: { projectId: string }) {
  const [replyState, replyAction, replyPending] = useActionState(
    replyPortalMessageAction,
    initialReply,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [projectId]);

  return (
    <form
      action={replyAction}
      className="mx-auto mb-5 w-[min(32rem,calc(100%-3rem))] shrink-0 sm:w-[min(32rem,calc(100%-4rem))]"
    >
      <input type="hidden" name="projectId" value={projectId} />
      <div className="flex items-end gap-2 rounded-[1.25rem] border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-gray-300 focus-within:ring-2 focus-within:ring-gray-200">
        <label htmlFor="desk-message-reply" className="sr-only">
          Message
        </label>
        <textarea
          ref={textareaRef}
          id="desk-message-reply"
          name="body"
          required
          rows={1}
          placeholder="Write a message…"
          className="max-h-36 min-h-[2.5rem] flex-1 resize-none bg-transparent py-2 text-[15px] text-dark-950 outline-none placeholder:text-gray-400"
          onInput={(event) => {
            const el = event.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
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
      </div>
      <FormError>{replyState.error}</FormError>
      <p className="mt-1.5 px-1 text-[11px] text-gray-400">
        Enter to send · Shift+Enter for a new line
      </p>
    </form>
  );
}
