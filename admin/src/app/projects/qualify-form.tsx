"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { QUALIFY_OUTCOMES, type QualifyOutcome } from "@/db/schema";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { BUDGET_OPTIONS, TIMELINE_OPTIONS } from "@/lib/form-options";
import { qualifyOutcomeLabel } from "@/lib/labels";
import { saveQualifyAction, type FormState } from "./actions";

const initialState: FormState = { error: null };

function selectWithCurrent(
  options: readonly string[],
  current: string,
): string[] {
  if (!current || (options as readonly string[]).includes(current)) {
    return [...options];
  }
  return [current, ...options];
}

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
    budgetNote: string;
    callAt: string;
    notes: string;
  };
}) {
  const [state, action, pending] = useActionState(
    saveQualifyAction,
    initialState,
  );
  const fieldsLocked = qualify.outcome === "no";
  const timelineOptions = selectWithCurrent(TIMELINE_OPTIONS, qualify.neededBy);
  const budgetOptions = selectWithCurrent(BUDGET_OPTIONS, qualify.budgetNote);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="projectId" value={projectId} />
      {fieldsLocked ? (
        <>
          <input type="hidden" name="whoFor" value={qualify.whoFor} />
          <input type="hidden" name="painToday" value={qualify.painToday} />
          <input type="hidden" name="neededBy" value={qualify.neededBy} />
          <input type="hidden" name="budgetNote" value={qualify.budgetNote} />
          <input type="hidden" name="callAt" value={qualify.callAt} />
          <input type="hidden" name="notes" value={qualify.notes} />
        </>
      ) : null}

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
        <p className="mt-2 text-sm text-gray-500">
          {fieldsLocked
            ? "Change outcome away from Not a project to reopen the pipeline."
            : "Real project required before Discover."}
        </p>
      </div>

      <div>
        <label htmlFor="qualify-painToday" className={labelClassName}>
          What is painful today
        </label>
        <textarea
          id="qualify-painToday"
          name="painToday"
          rows={4}
          defaultValue={qualify.painToday}
          className={fieldClassName}
          placeholder="What is broken or slow?"
          disabled={fieldsLocked}
        />
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
          placeholder="Buyer, daily users, organisation…"
          disabled={fieldsLocked}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="qualify-neededBy" className={labelClassName}>
            Needed by
          </label>
          <select
            id="qualify-neededBy"
            name="neededBy"
            defaultValue={qualify.neededBy}
            className={fieldClassName}
            disabled={fieldsLocked}
          >
            <option value="">Not set</option>
            {timelineOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="qualify-budgetNote" className={labelClassName}>
            Budget
          </label>
          <select
            id="qualify-budgetNote"
            name="budgetNote"
            defaultValue={qualify.budgetNote}
            className={fieldClassName}
            disabled={fieldsLocked}
          >
            <option value="">Not set</option>
            {budgetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="qualify-callAt" className={labelClassName}>
            Call / window
          </label>
          <input
            id="qualify-callAt"
            name="callAt"
            defaultValue={qualify.callAt}
            className={fieldClassName}
            placeholder="When to talk"
            disabled={fieldsLocked}
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
          placeholder="Anything else from the screen or /start"
          disabled={fieldsLocked}
        />
      </div>

      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save qualify"}
      </Button>
    </form>
  );
}
