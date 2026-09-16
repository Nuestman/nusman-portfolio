"use client";

import { useActionState } from "react";
import { PROJECT_STATUSES } from "@/db/schema";
import type { ProjectStatus } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { updateProjectAction, type FormState } from "@/app/projects/actions";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { projectStatusLabel } from "@/lib/labels";

const initialState: FormState = { error: null };

export function ProjectDetailsForm({
  project,
  problemHint,
  hideBudget = false,
}: {
  project: {
    id: string;
    title: string;
    problemSentence: string;
    successLooksLike: string;
    budgetNote: string;
    deadlineNote: string;
    status: ProjectStatus;
  };
  problemHint?: string;
  /** Budget lives on Qualify; hide the duplicate Job details field. */
  hideBudget?: boolean;
}) {
  const [state, action, pending] = useActionState(
    updateProjectAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={project.id} />
      {hideBudget ? (
        <input type="hidden" name="budgetNote" value={project.budgetNote} />
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
          placeholder="One sentence both sides agree on"
        />
        {problemHint ? (
          <p className="mt-2 text-sm text-gray-500">{problemHint}</p>
        ) : null}
      </div>

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
          placeholder="How you will know it worked"
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
        {pending ? "Saving…" : "Save brief"}
      </Button>
    </form>
  );
}
