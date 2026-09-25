"use client";

import { useActionState, useState } from "react";
import {
  PROJECT_STATUSES,
  QUALIFY_OUTCOMES,
  type ProjectStatus,
  type QualifyOutcome,
} from "@/db/schema";
import { Button } from "@/components/ui/button";
import { updateProjectAction, type FormState } from "@/app/projects/actions";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import {
  BUDGET_OPTIONS,
  isPresetTimeline,
  TIMELINE_MANUAL_VALUE,
  TIMELINE_OPTIONS,
} from "@/lib/form-options";
import {
  projectStatusLabel,
  qualifyOutcomeLabel,
  WANT_BUILT_LABEL,
} from "@/lib/labels";

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

function initialTimelineChoice(value: string): string {
  if (!value) {
    return "";
  }
  if (isPresetTimeline(value)) {
    return value;
  }
  return TIMELINE_MANUAL_VALUE;
}

export function ProjectDetailsForm({
  project,
  problemHint,
  showQualify = false,
  hideWantBuilt = false,
  submitLabel = "Save brief",
  nextPath,
}: {
  project: {
    id: string;
    title: string;
    problemSentence: string;
    wantBuilt: string;
    successLooksLike: string;
    whoFor: string;
    qualifyOutcome: QualifyOutcome;
    budgetNote: string;
    deadlineNote: string;
    callAt: string;
    qualifyNotes: string;
    status: ProjectStatus;
  };
  problemHint?: string;
  /** Hiring jobs: outcome, who, budget select, call, notes. */
  showQualify?: boolean;
  /** Own-product records do not use the hiring brief field. */
  hideWantBuilt?: boolean;
  submitLabel?: string;
  nextPath?: string;
}) {
  const [state, action, pending] = useActionState(
    updateProjectAction,
    initialState,
  );
  const fieldsLocked = showQualify && project.qualifyOutcome === "no";
  const [timelineChoice, setTimelineChoice] = useState(() =>
    initialTimelineChoice(project.deadlineNote),
  );
  const [timelineManual, setTimelineManual] = useState(() =>
    isPresetTimeline(project.deadlineNote) || !project.deadlineNote
      ? ""
      : project.deadlineNote,
  );
  const budgetOptions = selectWithCurrent(BUDGET_OPTIONS, project.budgetNote);
  const timelineValue =
    timelineChoice === TIMELINE_MANUAL_VALUE
      ? timelineManual.trim()
      : timelineChoice;

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={project.id} />
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      {!showQualify ? (
        <>
          <input
            type="hidden"
            name="qualifyOutcome"
            value={project.qualifyOutcome}
          />
          <input type="hidden" name="whoFor" value={project.whoFor} />
          <input type="hidden" name="callAt" value={project.callAt} />
          <input type="hidden" name="qualifyNotes" value={project.qualifyNotes} />
        </>
      ) : null}
      {hideWantBuilt ? (
        <input type="hidden" name="wantBuilt" value={project.wantBuilt} />
      ) : null}
      {showQualify && !fieldsLocked ? (
        <input type="hidden" name="deadlineNote" value={timelineValue} />
      ) : null}
      {showQualify && fieldsLocked ? (
        <>
          <input type="hidden" name="title" value={project.title} />
          <input type="hidden" name="status" value={project.status} />
          <input
            type="hidden"
            name="problemSentence"
            value={project.problemSentence}
          />
          <input type="hidden" name="wantBuilt" value={project.wantBuilt} />
          <input
            type="hidden"
            name="successLooksLike"
            value={project.successLooksLike}
          />
          <input type="hidden" name="whoFor" value={project.whoFor} />
          <input type="hidden" name="budgetNote" value={project.budgetNote} />
          <input
            type="hidden"
            name="deadlineNote"
            value={project.deadlineNote}
          />
          <input type="hidden" name="callAt" value={project.callAt} />
          <input
            type="hidden"
            name="qualifyNotes"
            value={project.qualifyNotes}
          />
        </>
      ) : null}

      {showQualify ? (
        <div>
          <label htmlFor="project-qualifyOutcome" className={labelClassName}>
            Qualify outcome
          </label>
          <select
            id="project-qualifyOutcome"
            name="qualifyOutcome"
            defaultValue={project.qualifyOutcome}
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
      ) : null}

      <div>
        <label htmlFor="project-title" className={labelClassName}>
          Title
        </label>
        <input
          id="project-title"
          name="title"
          required
          defaultValue={project.title}
          className={fieldClassName}
          disabled={fieldsLocked}
        />
      </div>

      <div>
        <label htmlFor="project-problemSentence" className={labelClassName}>
          Problem
        </label>
        <textarea
          id="project-problemSentence"
          name="problemSentence"
          rows={3}
          defaultValue={project.problemSentence}
          className={fieldClassName}
          placeholder="What is broken or slow — one sentence both sides can repeat"
          disabled={fieldsLocked}
        />
        {problemHint ? (
          <p className="mt-2 text-sm text-gray-500">{problemHint}</p>
        ) : null}
      </div>

      {hideWantBuilt ? null : (
        <div>
          <label htmlFor="project-wantBuilt" className={labelClassName}>
            {WANT_BUILT_LABEL}
          </label>
          <textarea
            id="project-wantBuilt"
            name="wantBuilt"
            rows={3}
            defaultValue={project.wantBuilt}
            className={fieldClassName}
            placeholder="The thing both sides agree to make — after the problem is clear"
            disabled={fieldsLocked}
          />
        </div>
      )}

      <div>
        <label htmlFor="project-successLooksLike" className={labelClassName}>
          Success looks like
        </label>
        <textarea
          id="project-successLooksLike"
          name="successLooksLike"
          rows={3}
          defaultValue={project.successLooksLike}
          className={fieldClassName}
          placeholder="How will you both know this worked?"
          disabled={fieldsLocked}
        />
      </div>

      {showQualify ? (
        <div>
          <label htmlFor="project-whoFor" className={labelClassName}>
            Who it is for
          </label>
          <input
            id="project-whoFor"
            name="whoFor"
            defaultValue={project.whoFor}
            className={fieldClassName}
            placeholder="Who uses it, who pays, who decides?"
            disabled={fieldsLocked}
          />
        </div>
      ) : null}

      <div
        className={
          showQualify
            ? "grid gap-5 sm:grid-cols-3"
            : "grid gap-5 sm:grid-cols-2"
        }
      >
        {showQualify ? (
          <>
            <div>
              <label htmlFor="project-deadlineNote" className={labelClassName}>
                Needed by
              </label>
              <select
                id="project-deadlineNote"
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
                  id="project-deadlineNote-manual"
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
              <label htmlFor="project-budgetNote" className={labelClassName}>
                Budget
              </label>
              <select
                id="project-budgetNote"
                name="budgetNote"
                defaultValue={project.budgetNote}
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
              <label htmlFor="project-callAt" className={labelClassName}>
                Call / meet
              </label>
              <input
                id="project-callAt"
                name="callAt"
                defaultValue={project.callAt}
                className={fieldClassName}
                placeholder="When to talk"
                disabled={fieldsLocked}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label htmlFor="project-budgetNote" className={labelClassName}>
                Budget note
              </label>
              <input
                id="project-budgetNote"
                name="budgetNote"
                defaultValue={project.budgetNote}
                className={fieldClassName}
              />
            </div>
            <div>
              <label htmlFor="project-deadlineNote" className={labelClassName}>
                Deadline note
              </label>
              <input
                id="project-deadlineNote"
                name="deadlineNote"
                defaultValue={project.deadlineNote}
                className={fieldClassName}
                placeholder="Target date or window"
              />
            </div>
          </>
        )}
        <div className={showQualify ? "sm:col-span-3" : undefined}>
          <label htmlFor="project-status" className={labelClassName}>
            Status
          </label>
          <select
            id="project-status"
            name="status"
            defaultValue={project.status}
            className={fieldClassName}
            disabled={fieldsLocked}
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {projectStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showQualify ? (
        <div>
          <label htmlFor="project-qualifyNotes" className={labelClassName}>
            Notes
          </label>
          <textarea
            id="project-qualifyNotes"
            name="qualifyNotes"
            rows={3}
            defaultValue={project.qualifyNotes}
            className={fieldClassName}
            placeholder="Anything else from the screen or /start"
            disabled={fieldsLocked}
          />
        </div>
      ) : null}

      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
