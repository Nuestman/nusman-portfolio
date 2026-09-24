"use client";

import { useActionState } from "react";
import { PROJECT_STATUSES } from "@/db/schema";
import type { ProjectStatus } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { updateProjectAction, type FormState } from "@/app/projects/actions";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { projectStatusLabel, WANT_BUILT_LABEL } from "@/lib/labels";

const initialState: FormState = { error: null };

export function ProjectDetailsForm({
  project,
  problemHint,
  hideBudget = false,
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
    budgetNote: string;
    deadlineNote: string;
    status: ProjectStatus;
  };
  problemHint?: string;
  /** Budget lives on Qualify; hide the duplicate Job details field. */
  hideBudget?: boolean;
  /** Own-product records do not use the hiring brief field. */
  hideWantBuilt?: boolean;
  submitLabel?: string;
  nextPath?: string;
}) {
  const [state, action, pending] = useActionState(
    updateProjectAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={project.id} />
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}
      {hideBudget ? (
        <input type="hidden" name="budgetNote" value={project.budgetNote} />
      ) : null}
      {hideWantBuilt ? (
        <input type="hidden" name="wantBuilt" value={project.wantBuilt} />
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
        />
      </div>

      <div>
        <label htmlFor="project-problemSentence" className={labelClassName}>
          Problem sentence
        </label>
        <textarea
          id="project-problemSentence"
          name="problemSentence"
          rows={3}
          defaultValue={project.problemSentence}
          className={fieldClassName}
          placeholder="Write the one-line lock, or save discovery answers first."
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
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {!hideBudget ? (
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
        ) : null}
        <div className={hideBudget ? "sm:col-span-1" : undefined}>
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
        <div>
          <label htmlFor="project-status" className={labelClassName}>
            Status
          </label>
          <select
            id="project-status"
            name="status"
            defaultValue={project.status}
            className={fieldClassName}
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {projectStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
