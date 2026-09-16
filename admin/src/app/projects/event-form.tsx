"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import {
  PROJECT_EVENT_KINDS,
  PROJECT_EVENT_STATUSES,
  type ProjectEventKind,
  type ProjectEventStatus,
} from "@/db/schema";
import {
  projectEventKindLabel,
  projectEventStatusLabel,
} from "@/lib/labels";
import { toDatetimeLocalValue } from "@/lib/text";
import {
  createProjectEventAction,
  updateProjectEventAction,
  type FormState,
} from "./actions";

const initialState: FormState = { error: null };

type EventFields = {
  id: string;
  kind: ProjectEventKind;
  title: string;
  status: ProjectEventStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  location: string | null;
  notes: string | null;
};

export function ProjectEventForm({
  projectId,
  event,
  submitLabel,
}: {
  projectId: string;
  event?: EventFields;
  submitLabel: string;
}) {
  const action = event ? updateProjectEventAction : createProjectEventAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const prefix = event ? "edit-event" : "event";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      {event ? <input type="hidden" name="id" value={event.id} /> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}-kind`} className={labelClassName}>
            Kind
          </label>
          <select
            id={`${prefix}-kind`}
            name="kind"
            required
            defaultValue={event?.kind ?? "meeting"}
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
          <label htmlFor={`${prefix}-status`} className={labelClassName}>
            Status
          </label>
          <select
            id={`${prefix}-status`}
            name="status"
            required
            defaultValue={event?.status ?? "proposed"}
            className={fieldClassName}
          >
            {PROJECT_EVENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {projectEventStatusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor={`${prefix}-title`} className={labelClassName}>
          Title
        </label>
        <input
          id={`${prefix}-title`}
          name="title"
          required
          defaultValue={event?.title ?? ""}
          className={fieldClassName}
          placeholder="Discovery call"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`${prefix}-starts`} className={labelClassName}>
            Starts
          </label>
          <input
            id={`${prefix}-starts`}
            name="startsAt"
            type="datetime-local"
            defaultValue={toDatetimeLocalValue(event?.startsAt)}
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor={`${prefix}-ends`} className={labelClassName}>
            Ends
          </label>
          <input
            id={`${prefix}-ends`}
            name="endsAt"
            type="datetime-local"
            defaultValue={toDatetimeLocalValue(event?.endsAt)}
            className={fieldClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${prefix}-location`} className={labelClassName}>
          Location
        </label>
        <input
          id={`${prefix}-location`}
          name="location"
          defaultValue={event?.location ?? ""}
          className={fieldClassName}
          placeholder="Zoom, WhatsApp, or place"
        />
      </div>

      <div>
        <label htmlFor={`${prefix}-notes`} className={labelClassName}>
          Notes
        </label>
        <textarea
          id={`${prefix}-notes`}
          name="notes"
          rows={3}
          defaultValue={event?.notes ?? ""}
          className={fieldClassName}
          placeholder="Agenda or prep"
        />
      </div>

      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
