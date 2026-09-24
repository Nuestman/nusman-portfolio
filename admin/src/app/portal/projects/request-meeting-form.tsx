"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import {
  PROJECT_EVENT_KINDS,
  type ProjectEventKind,
  type PersonRole,
} from "@/db/schema";
import {
  projectEventKindLabel,
  personRoleLabel,
} from "@/lib/labels";
import {
  requestPortalEventAction,
  type PortalFormState,
} from "./actions";

const initialState: PortalFormState = { error: null };

export type PortalScheduleProject = { id: string; title: string };
export type PortalSchedulePerson = {
  id: string;
  name: string;
  role: PersonRole;
};

export function PortalRequestMeetingForm({
  projects,
  people,
  defaultPersonId,
  defaultProjectId,
  defaultKind = "meeting",
  defaultTitle = "",
  lockProject = false,
  submitLabel = "Request meeting",
  returnPath,
}: {
  projects: PortalScheduleProject[];
  people: PortalSchedulePerson[];
  defaultPersonId: string;
  defaultProjectId?: string;
  defaultKind?: ProjectEventKind;
  defaultTitle?: string;
  /** Hide the project picker when the page is already scoped to one job. */
  lockProject?: boolean;
  submitLabel?: string;
  /** After submit, return here instead of the hub (safe internal path). */
  returnPath?: string;
}) {
  const [state, action, pending] = useActionState(
    requestPortalEventAction,
    initialState,
  );

  if (projects.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        No projects yet. When Usman opens one for you, you can request meetings
        here.
      </p>
    );
  }

  const lockedProjectId =
    defaultProjectId &&
    projects.some((project) => project.id === defaultProjectId)
      ? defaultProjectId
      : projects[0]!.id;

  const personDefault = people.some((person) => person.id === defaultPersonId)
    ? defaultPersonId
    : (people[0]?.id ?? "");

  return (
    <form action={action} className="space-y-4">
      {returnPath ? (
        <input type="hidden" name="next" value={returnPath} />
      ) : null}
      {lockProject ? (
        <input type="hidden" name="projectId" value={lockedProjectId} />
      ) : (
        <div>
          <label htmlFor="request-project" className={labelClassName}>
            Project
          </label>
          <select
            id="request-project"
            name="projectId"
            required
            defaultValue={lockedProjectId}
            className={fieldClassName}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="request-person" className={labelClassName}>
          Who is this for
        </label>
        <select
          id="request-person"
          name="personId"
          required
          defaultValue={personDefault}
          className={fieldClassName}
          disabled={people.length === 0}
        >
          {people.length === 0 ? (
            <option value="">No people on this account</option>
          ) : (
            people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} · {personRoleLabel(person.role)}
                {person.id === defaultPersonId ? " (you)" : ""}
              </option>
            ))
          )}
        </select>
      </div>

      <div>
        <label htmlFor="request-kind" className={labelClassName}>
          Kind
        </label>
        <select
          id="request-kind"
          name="kind"
          required
          defaultValue={defaultKind}
          className={fieldClassName}
        >
          {PROJECT_EVENT_KINDS.map((kind) => (
            <option key={kind} value={kind}>
              {projectEventKindLabel(kind)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="request-title" className={labelClassName}>
          What for
        </label>
        <input
          id="request-title"
          name="title"
          required
          defaultValue={defaultTitle}
          className={fieldClassName}
          placeholder="Discovery call"
        />
      </div>

      <div>
        <label htmlFor="request-starts" className={labelClassName}>
          Preferred time (optional)
        </label>
        <input
          id="request-starts"
          name="startsAt"
          type="datetime-local"
          className={fieldClassName}
        />
      </div>

      <div>
        <label htmlFor="request-notes" className={labelClassName}>
          Notes (optional)
        </label>
        <textarea
          id="request-notes"
          name="notes"
          rows={3}
          className={fieldClassName}
          placeholder="Anything Usman should know"
        />
      </div>

      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending || people.length === 0}>
        {pending ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
