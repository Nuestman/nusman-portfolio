"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  addNoteAction,
  updateNoteAction,
  type FormState,
} from "@/app/projects/actions";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";

const initialState: FormState = { error: null };

export function NoteForm({
  projectId,
  note,
  submitLabel = "Add note",
}: {
  projectId: string;
  note?: { id: string; body: string };
  submitLabel?: string;
}) {
  const action = note ? updateNoteAction : addNoteAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const bodyId = note ? "edit-note-body" : "note-body";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      {note ? <input type="hidden" name="id" value={note.id} /> : null}
      <div>
        <label htmlFor={bodyId} className={labelClassName}>
          {note ? "Note" : "New note"}
        </label>
        <textarea
          id={bodyId}
          name="body"
          required
          rows={4}
          defaultValue={note?.body ?? ""}
          className={fieldClassName}
          placeholder="Call, WhatsApp decision, scope change…"
        />
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
