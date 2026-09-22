"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { MessageComposer } from "@/components/messages/message-composer";
import { labelClassName } from "@/lib/forms";
import {
  postPortalMessageAction,
  type PortalFormState,
} from "@/app/portal/projects/actions";

const initialState: PortalFormState = { error: null };

export function PortalMessageForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(
    postPortalMessageAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      <div>
        <label htmlFor="portal-message-body" className={labelClassName}>
          Message
        </label>
        <MessageComposer
          id="portal-message-body"
          allowAttachments
          disabled={pending}
          placeholder="Question, update, or decision…"
        />
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
