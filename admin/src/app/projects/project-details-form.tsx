"use client";

import { useActionState } from "react";
import { PROJECT_STATUSES } from "@/db/schema";
import type { ProjectStatus } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { updateProjectAction, type FormState } from "@/app/projects/actions";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { projectStatusLabel } from "@/lib/labels";

const initialState: FormState = { error: null };

export function ProjectDetailsForm({
  project,
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
}) {
  const [state, action, pending] = useActionState(
    updateProjectAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="id" value={project.id} />
      <div>
        <label htmlFor="title" className={labelClassName}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={project.title}
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="problemSentence" className={labelClassName}>
          Problem sentence
        </label>
        <textarea
          id="problemSentence"
          name="problemSentence"
          rows={3}
          defaultValue={project.problemSentence}
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="successLooksLike" className={labelClassName}>
          Success looks like
        </label>
        <textarea
          id="successLooksLike"
          name="successLooksLike"
          rows={3}
          defaultValue={project.successLooksLike}
          className={fieldClassName}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="budgetNote" className={labelClassName}>
            Budget note
          </label>
          <input
            id="budgetNote"
            name="budgetNote"
            defaultValue={project.budgetNote}
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="deadlineNote" className={labelClassName}>
            Deadline note
          </label>
          <input
            id="deadlineNote"
            name="deadlineNote"
            defaultValue={project.deadlineNote}
            className={fieldClassName}
          />
        </div>
      </div>
      <div>
        <label htmlFor="status" className={labelClassName}>
          Status
        </label>
        <select
          id="status"
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
      {state.error ? (
        <p className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save project"}
      </Button>
    </form>
  );
}
