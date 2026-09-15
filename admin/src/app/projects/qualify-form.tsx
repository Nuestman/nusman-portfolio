"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { QUALIFY_OUTCOMES, type QualifyOutcome } from "@/db/schema";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { qualifyOutcomeLabel } from "@/lib/labels";
import { saveQualifyAction, type FormState } from "./actions";

const initialState: FormState = { error: null };

export function QualifyForm({
  projectId,
  qualify,
}: {
  projectId: string;
  qualify: {
    outcome: QualifyOutcome;
    whoFor: string;
    painToday: string;
    neededBy: string;
    callAt: string;
    notes: string;
  };
}) {
  const [state, action, pending] = useActionState(
    saveQualifyAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      <div>
        <label htmlFor="qualify-outcome" className={labelClassName}>
          Outcome
        </label>
        <select
          id="qualify-outcome"
          name="outcome"
          defaultValue={qualify.outcome}
          className={fieldClassName}
        >
          {QUALIFY_OUTCOMES.map((outcome) => (
            <option key={outcome} value={outcome}>
              {qualifyOutcomeLabel(outcome)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="qualify-whoFor" className={labelClassName}>
          Who it is for
        </label>
        <input
          id="qualify-whoFor"
          name="whoFor"
          defaultValue={qualify.whoFor}
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="qualify-painToday" className={labelClassName}>
          What is painful today
        </label>
        <textarea
          id="qualify-painToday"
          name="painToday"
          rows={3}
          defaultValue={qualify.painToday}
          className={fieldClassName}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="qualify-neededBy" className={labelClassName}>
            Needed by
          </label>
          <input
            id="qualify-neededBy"
            name="neededBy"
            defaultValue={qualify.neededBy}
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="qualify-callAt" className={labelClassName}>
            15-min call
          </label>
          <input
            id="qualify-callAt"
            name="callAt"
            defaultValue={qualify.callAt}
            className={fieldClassName}
            placeholder="Date or window"
          />
        </div>
      </div>
      <div>
        <label htmlFor="qualify-notes" className={labelClassName}>
          Notes
        </label>
        <textarea
          id="qualify-notes"
          name="notes"
          rows={3}
          defaultValue={qualify.notes}
          className={fieldClassName}
        />
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save qualify"}
      </Button>
    </form>
  );
}
