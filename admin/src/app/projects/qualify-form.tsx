"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { QUALIFY_OUTCOMES, type QualifyOutcome } from "@/db/schema";
import { fieldClassName, labelClassName } from "@/lib/forms";
import {
  BUDGET_OPTIONS,
  isPresetTimeline,
  TIMELINE_MANUAL_VALUE,
  TIMELINE_OPTIONS,
} from "@/lib/form-options";
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

function initialTimelineChoice(neededBy: string): string {
  if (!neededBy) {
    return "";
  }
  if (isPresetTimeline(neededBy)) {
    return neededBy;
  }
  return TIMELINE_MANUAL_VALUE;
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
  const [timelineChoice, setTimelineChoice] = useState(() =>
    initialTimelineChoice(qualify.neededBy),
  );
  const [timelineManual, setTimelineManual] = useState(() =>
    isPresetTimeline(qualify.neededBy) || !qualify.neededBy
      ? ""
      : qualify.neededBy,
  );
  const budgetOptions = selectWithCurrent(BUDGET_OPTIONS, qualify.budgetNote);

  const timelineValue =
    timelineChoice === TIMELINE_MANUAL_VALUE
      ? timelineManual.trim()
      : timelineChoice;

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
      ) : (
        <input type="hidden" name="neededBy" value={timelineValue} />
      )}

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
            value={timelineChoice}
            className={fieldClassName}
            disabled={fieldsLocked}
            onChange={(event) => {
              setTimelineChoice(event.target.value);
              if (event.target.value !== TIMELINE_MANUAL_VALUE) {
                setTimelineManual("");
              }
            }}
          >
            <option value="">Not set</option>
            {TIMELINE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value={TIMELINE_MANUAL_VALUE}>Enter manually</option>
          </select>
          {timelineChoice === TIMELINE_MANUAL_VALUE && !fieldsLocked ? (
            <input
              id="qualify-neededBy-manual"
              type="text"
              value={timelineManual}
              onChange={(event) => setTimelineManual(event.target.value)}
              required
              maxLength={200}
              className={`${fieldClassName} mt-2`}
              placeholder="e.g. before Easter, mid-July"
            />
          ) : null}
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
            Call / meet
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
