"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { addNoteAction, type FormState } from "@/app/projects/actions";
import { fieldClassName, labelClassName } from "@/lib/forms";

const initialState: FormState = { error: null };

export function NoteForm({ projectId }: { projectId: string }) {
  const [state, action, pending] = useActionState(addNoteAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      <div>
        <label htmlFor="body" className={labelClassName}>
          New note
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={4}
          className={fieldClassName}
          placeholder="Call, WhatsApp decision, scope change…"
        />
      </div>
      {state.error ? (
        <p className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add note"}
      </Button>
    </form>
  );
}
