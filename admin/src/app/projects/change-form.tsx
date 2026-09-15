"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { CHANGE_STATUSES, type ChangeStatus } from "@/db/schema";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { changeStatusLabel } from "@/lib/labels";
import {
  createChangeRequestAction,
  updateChangeRequestAction,
  type FormState,
} from "./actions";

const initialState: FormState = { error: null };

export function ChangeForm({
  projectId,
  change,
  submitLabel,
}: {
  projectId: string;
  change?: { id: string; body: string; status: ChangeStatus };
  submitLabel: string;
}) {
  const action = change
    ? updateChangeRequestAction
    : createChangeRequestAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const bodyId = change ? "edit-change-body" : "change-body";
  const statusId = change ? "edit-change-status" : "change-status";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      {change ? <input type="hidden" name="id" value={change.id} /> : null}
      <div>
        <label htmlFor={bodyId} className={labelClassName}>
          Change request
        </label>
        <textarea
          id={bodyId}
          name="body"
          required
          rows={3}
          defaultValue={change?.body ?? ""}
          className={fieldClassName}
          placeholder="Park it. Price it later. Do not sneak it into the sprint."
        />
      </div>
      <div>
        <label htmlFor={statusId} className={labelClassName}>
          Status
        </label>
        <select
          id={statusId}
          name="status"
          defaultValue={change?.status ?? "parked"}
          className={fieldClassName}
        >
          {CHANGE_STATUSES.map((status) => (
            <option key={status} value={status}>
              {changeStatusLabel(status)}
            </option>
          ))}
        </select>
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
