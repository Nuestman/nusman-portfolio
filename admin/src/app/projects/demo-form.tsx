"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import {
  createDemoAction,
  updateDemoAction,
  type FormState,
} from "./actions";

const initialState: FormState = { error: null };

export function DemoForm({
  projectId,
  demo,
  isProduct = false,
  submitLabel,
}: {
  projectId: string;
  demo?: { id: string; happenedAt: string; notes: string };
  isProduct?: boolean;
  submitLabel: string;
}) {
  const action = demo ? updateDemoAction : createDemoAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const whenId = demo ? "edit-demo-when" : "demo-when";
  const notesId = demo ? "edit-demo-notes" : "demo-notes";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      {demo ? <input type="hidden" name="id" value={demo.id} /> : null}
      <div>
        <label htmlFor={whenId} className={labelClassName}>
          When
        </label>
        <input
          id={whenId}
          name="happenedAt"
          defaultValue={demo?.happenedAt ?? ""}
          className={fieldClassName}
          placeholder="Week of…"
        />
      </div>
      <div>
        <label htmlFor={notesId} className={labelClassName}>
          Demo notes
        </label>
        <textarea
          id={notesId}
          name="notes"
          required
          rows={3}
          defaultValue={demo?.notes ?? ""}
          className={fieldClassName}
          placeholder={
            isProduct
              ? "What you tapped. What to change."
              : "What the daily user tapped. What to change."
          }
        />
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
