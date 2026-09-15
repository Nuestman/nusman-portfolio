"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  addActivityAction,
  updateActivityAction,
  type FormState,
} from "@/app/log/actions";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";

const initialState: FormState = { error: null };

export function ActivityForm({
  next,
  activity,
  submitLabel = "Add to journal",
}: {
  next: "/" | "/log";
  activity?: { id: string; body: string };
  submitLabel?: string;
}) {
  const action = activity ? updateActivityAction : addActivityAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {activity ? <input type="hidden" name="id" value={activity.id} /> : null}
      <div>
        <label
          htmlFor={activity ? "edit-activity-body" : "activity-body"}
          className={labelClassName}
        >
          {activity ? "Line" : "New line"}
        </label>
        <textarea
          id={activity ? "edit-activity-body" : "activity-body"}
          name="body"
          required
          rows={3}
          defaultValue={activity?.body ?? ""}
          className={fieldClassName}
          placeholder="Non-client work, a reminder, something to park…"
        />
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
