"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormError } from "@/components/form-error";
import { IncompleteInfoBadge } from "@/components/incomplete-info-badge";
import { MarkedValue } from "@/components/set-mark";
import { fieldClassName, labelClassName } from "@/lib/forms";
import {
  BUDGET_OPTIONS,
  isPresetTimeline,
  TIMELINE_MANUAL_VALUE,
  TIMELINE_OPTIONS,
} from "@/lib/form-options";
import { WANT_BUILT_LABEL } from "@/lib/labels";
import { isBlank } from "@/lib/text";
import {
  savePortalBriefAction,
  type PortalFormState,
} from "@/app/portal/projects/actions";

const initialState: PortalFormState = { error: null };

function BriefEyebrow({ children }: { children: string }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-700">
      {children}
    </p>
  );
}

function BriefSection({
  label,
  value,
  size = "body",
}: {
  label: string;
  value: string | null | undefined;
  size?: "lead" | "body" | "meta";
}) {
  return (
    <div>
      <BriefEyebrow>{label}</BriefEyebrow>
      <MarkedValue value={value} size={size} />
    </div>
  );
}

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

function TimelineSelect({
  id,
  label,
  choice,
  manual,
  onChoice,
  onManual,
}: {
  id: string;
  label: string;
  choice: string;
  manual: string;
  onChoice: (value: string) => void;
  onManual: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClassName}>
        {label}
      </label>
      <select
        id={id}
        value={choice}
        className={fieldClassName}
        onChange={(event) => {
          onChoice(event.target.value);
          if (event.target.value !== TIMELINE_MANUAL_VALUE) {
            onManual("");
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
      {choice === TIMELINE_MANUAL_VALUE ? (
        <input
          id={`${id}-manual`}
          type="text"
          value={manual}
          onChange={(event) => onManual(event.target.value)}
          required
          maxLength={200}
          className={`${fieldClassName} mt-2`}
          placeholder="e.g. before Easter, mid-July"
        />
      ) : null}
    </div>
  );
}

function PortalBriefForm({
  projectId,
  problem,
  wantBuilt,
  success,
  deadline,
  whoFor,
  budgetNote,
  notes,
  onCancel,
}: {
  projectId: string;
  problem: string;
  wantBuilt: string;
  success: string;
  deadline: string;
  whoFor: string;
  budgetNote: string;
  notes: string;
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    savePortalBriefAction,
    initialState,
  );
  const [timelineChoice, setTimelineChoice] = useState(() =>
    initialTimelineChoice(deadline),
  );
  const [timelineManual, setTimelineManual] = useState(() =>
    isPresetTimeline(deadline) || !deadline ? "" : deadline,
  );
  const budgetOptions = selectWithCurrent(BUDGET_OPTIONS, budgetNote);
  const timelineValue =
    timelineChoice === TIMELINE_MANUAL_VALUE
      ? timelineManual.trim()
      : timelineChoice;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="deadline" value={timelineValue} />

      <div>
        <label htmlFor="portal-brief-problem" className={labelClassName}>
          What&apos;s the problem?
        </label>
        <textarea
          id="portal-brief-problem"
          name="problem"
          rows={3}
          defaultValue={problem}
          className={fieldClassName}
          placeholder="What is broken or slow today?"
        />
      </div>

      <div>
        <label htmlFor="portal-brief-wantBuilt" className={labelClassName}>
          {WANT_BUILT_LABEL}
        </label>
        <textarea
          id="portal-brief-wantBuilt"
          name="wantBuilt"
          rows={3}
          defaultValue={wantBuilt}
          className={fieldClassName}
          placeholder="The thing we agree to make, after the problem is clear."
        />
      </div>

      <div>
        <label htmlFor="portal-brief-success" className={labelClassName}>
          What does success look like?
        </label>
        <textarea
          id="portal-brief-success"
          name="successLooksLike"
          rows={3}
          defaultValue={success}
          className={fieldClassName}
          placeholder="How will you both know this worked?"
        />
      </div>

      <div>
        <label htmlFor="portal-brief-whoFor" className={labelClassName}>
          Who it is for
        </label>
        <input
          id="portal-brief-whoFor"
          name="whoFor"
          defaultValue={whoFor}
          className={fieldClassName}
          placeholder="Who uses it, who pays, who decides?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TimelineSelect
          id="portal-brief-deadline"
          label="Needed by"
          choice={timelineChoice}
          manual={timelineManual}
          onChoice={setTimelineChoice}
          onManual={setTimelineManual}
        />
        <div>
          <label htmlFor="portal-brief-budgetNote" className={labelClassName}>
            Budget
          </label>
          <select
            id="portal-brief-budgetNote"
            name="budgetNote"
            defaultValue={budgetNote}
            className={fieldClassName}
          >
            <option value="">Not set</option>
            {budgetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="portal-brief-notes" className={labelClassName}>
          Notes
        </label>
        <textarea
          id="portal-brief-notes"
          name="notes"
          rows={3}
          defaultValue={notes}
          className={fieldClassName}
          placeholder="Anything else we should know"
        />
      </div>

      <FormError>{state.error}</FormError>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save brief"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export function PortalProjectBrief({
  projectId,
  title,
  canEdit = false,
  problem,
  wantBuilt,
  success,
  inScope,
  outOfScope,
  deadline,
  packageName,
  whoFor,
  budgetNote,
  notes,
}: {
  projectId: string;
  title: string;
  canEdit?: boolean;
  problem: string | null;
  wantBuilt: string | null;
  success: string | null;
  inScope: string | null;
  outOfScope: string | null;
  deadline: string | null;
  packageName: string | null;
  whoFor: string | null;
  budgetNote: string | null;
  notes: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const incomplete = [
    problem,
    wantBuilt,
    success,
    deadline,
    whoFor,
    budgetNote,
  ].some(isBlank);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-700">
            Project
          </p>
          <CardTitle className="mt-2 text-3xl leading-tight text-dark-950 sm:text-4xl">
            {title}
          </CardTitle>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {incomplete ? <IncompleteInfoBadge /> : null}
          {canEdit ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditing((current) => !current)}
            >
              {editing
                ? "Cancel"
                : incomplete
                  ? "Fill details"
                  : "Update details"}
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {canEdit && editing ? (
          <PortalBriefForm
            projectId={projectId}
            problem={problem ?? ""}
            wantBuilt={wantBuilt ?? ""}
            success={success ?? ""}
            deadline={deadline ?? ""}
            whoFor={whoFor ?? ""}
            budgetNote={budgetNote ?? ""}
            notes={notes ?? ""}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2">
              <BriefSection
                label="Package"
                value={packageName}
                size="meta"
              />
              <BriefSection
                label="Needed by"
                value={deadline}
                size="meta"
              />
            </div>

            <BriefSection
              label="Problem"
              value={problem}
              size="lead"
            />
            <BriefSection
              label={WANT_BUILT_LABEL}
              value={wantBuilt}
            />
            <BriefSection
              label="Success looks like"
              value={success}
            />
            <BriefSection
              label="Who it is for"
              value={whoFor}
              size="meta"
            />
            <BriefSection
              label="Budget"
              value={budgetNote}
              size="meta"
            />

            {notes?.trim() ? (
              <BriefSection label="Notes" value={notes} />
            ) : null}

            <div className="grid gap-5 sm:grid-cols-2">
              <BriefSection label="In scope" value={inScope} />
              <BriefSection label="Out of scope" value={outOfScope} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
