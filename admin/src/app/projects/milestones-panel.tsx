"use client";

import { useActionState } from "react";
import { ConfirmClick } from "@/components/confirm-submit";
import { Button, buttonClassName } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName } from "@/lib/forms";
import { formatStamp } from "@/lib/text";
import {
  saveMilestoneNoteAction,
  toggleMilestoneAction,
  type FormState,
} from "./actions";

const initialState: FormState = { error: null };

type MilestoneRow = {
  id: string;
  key: string;
  label: string;
  stage: string;
  sortOrder?: number;
  doneAt: Date | string | null;
  note: string | null;
};

export function MilestonesPanel({
  projectId,
  milestones,
  locked = false,
}: {
  projectId: string;
  milestones: MilestoneRow[];
  /** When true (disqualified / closed job), no ticking. */
  locked?: boolean;
}) {
  const ordered = [...milestones].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );
  const firstOpenIndex = ordered.findIndex((item) => !item.doneAt);
  const lastDoneIndex = (() => {
    for (let i = ordered.length - 1; i >= 0; i -= 1) {
      if (ordered[i]?.doneAt) {
        return i;
      }
    }
    return -1;
  })();

  return (
    <ul className="space-y-3">
      {ordered.map((item, index) => {
        const done = Boolean(item.doneAt);
        const canComplete =
          !locked && !done && (firstOpenIndex === -1 || index === firstOpenIndex);
        const canReopen = !locked && done && index === lastDoneIndex;
        const waitingOnPrior = !locked && !done && index > firstOpenIndex && firstOpenIndex >= 0;

        return (
          <li
            key={item.id}
            className={
              done
                ? "rounded-xl border border-gray-200 bg-gray-50 px-4 py-3"
                : waitingOnPrior
                  ? "rounded-xl border border-gray-100 bg-gray-50/80 px-4 py-3 opacity-70"
                  : "rounded-xl border border-gray-200 bg-white px-4 py-3"
            }
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p
                  className={
                    done
                      ? "font-medium text-gray-500 line-through"
                      : "font-medium text-dark-950"
                  }
                >
                  {item.label}
                </p>
                {item.doneAt ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Done {formatStamp(new Date(item.doneAt))}
                  </p>
                ) : waitingOnPrior ? (
                  <p className="mt-1 text-xs text-gray-500">
                    Finish earlier checkpoints first
                  </p>
                ) : (
                  <p className="mt-1 text-xs uppercase tracking-wide text-gray-500">
                    {item.stage}
                  </p>
                )}
                {item.note ? (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                    {item.note}
                  </p>
                ) : null}
              </div>
              {canComplete || canReopen ? (
                <form action={toggleMilestoneAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="hidden" name="projectId" value={projectId} />
                  <input type="hidden" name="done" value={done ? "0" : "1"} />
                  <ConfirmClick
                    message={
                      done
                        ? `Reopen “${item.label}”?`
                        : `Mark “${item.label}” done?`
                    }
                    className={buttonClassName(
                      done ? "outline" : "default",
                      "sm",
                    )}
                  >
                    {done ? "Reopen" : "Done"}
                  </ConfirmClick>
                </form>
              ) : null}
            </div>
            {!locked && (item.key === "payment_locked" || item.note) ? (
              <MilestoneNoteForm
                projectId={projectId}
                milestoneId={item.id}
                note={item.note ?? ""}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

function MilestoneNoteForm({
  projectId,
  milestoneId,
  note,
}: {
  projectId: string;
  milestoneId: string;
  note: string;
}) {
  const [state, action, pending] = useActionState(
    saveMilestoneNoteAction,
    initialState,
  );

  return (
    <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={milestoneId} />
      <input type="hidden" name="projectId" value={projectId} />
      <div className="min-w-[12rem] flex-1">
        <label className="sr-only" htmlFor={`milestone-note-${milestoneId}`}>
          Note
        </label>
        <input
          id={`milestone-note-${milestoneId}`}
          name="note"
          defaultValue={note}
          className={fieldClassName}
          placeholder="Optional note (e.g. deposit amount)"
        />
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save note"}
      </Button>
      <FormError>{state.error}</FormError>
    </form>
  );
}
