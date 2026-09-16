"use client";

import { useActionState, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import {
  PROJECT_EVENT_KINDS,
  PROJECT_EVENT_STATUSES,
} from "@/db/schema";
import {
  projectEventKindLabel,
  projectEventStatusLabel,
  personRoleLabel,
} from "@/lib/labels";
import type { PersonRole } from "@/db/schema";
import {
  createProjectEventAction,
  type FormState,
} from "@/app/projects/actions";

const initialState: FormState = { error: null };

export type ScheduleCreateClient = { id: string; name: string };
export type ScheduleCreateProject = {
  id: string;
  title: string;
  clientId: string;
};
export type ScheduleCreatePerson = {
  id: string;
  name: string;
  clientId: string;
  role: PersonRole;
};

export function DeskScheduleCreateForm({
  clients,
  projects,
  people,
}: {
  clients: ScheduleCreateClient[];
  projects: ScheduleCreateProject[];
  people: ScheduleCreatePerson[];
}) {
  const [state, formAction, pending] = useActionState(
    createProjectEventAction,
    initialState,
  );
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const clientProjects = useMemo(
    () => projects.filter((project) => project.clientId === clientId),
    [projects, clientId],
  );
  const [projectId, setProjectId] = useState(clientProjects[0]?.id ?? "");
  const team = useMemo(
    () => people.filter((person) => person.clientId === clientId),
    [people, clientId],
  );

  function onClientChange(nextClientId: string) {
    setClientId(nextClientId);
    const nextProjects = projects.filter(
      (project) => project.clientId === nextClientId,
    );
    setProjectId(nextProjects[0]?.id ?? "");
  }

  if (clients.length === 0 || projects.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        Add a hiring client and an active project before scheduling.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="next" value="/schedule" />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="desk-event-client" className={labelClassName}>
            Client
          </label>
          <select
            id="desk-event-client"
            required
            value={clientId}
            onChange={(event) => onClientChange(event.target.value)}
            className={fieldClassName}
          >
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="desk-event-project" className={labelClassName}>
            Project
          </label>
          <select
            id="desk-event-project"
            required
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            className={fieldClassName}
            disabled={clientProjects.length === 0}
          >
            {clientProjects.length === 0 ? (
              <option value="">No projects for this client</option>
            ) : (
              clientProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))
            )}
          </select>
        </div>
        <div>
          <label htmlFor="desk-event-person" className={labelClassName}>
            Person (optional)
          </label>
          <select
            key={clientId}
            id="desk-event-person"
            name="personId"
            defaultValue=""
            className={fieldClassName}
            disabled={team.length === 0}
          >
            <option value="">No one specific</option>
            {team.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name} · {personRoleLabel(person.role)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="desk-event-kind" className={labelClassName}>
            Kind
          </label>
          <select
            id="desk-event-kind"
            name="kind"
            required
            defaultValue="meeting"
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
          <label htmlFor="desk-event-status" className={labelClassName}>
            Status
          </label>
          <select
            id="desk-event-status"
            name="status"
            required
            defaultValue="proposed"
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
        <label htmlFor="desk-event-title" className={labelClassName}>
          Title
        </label>
        <input
          id="desk-event-title"
          name="title"
          required
          className={fieldClassName}
          placeholder="Discovery call"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="desk-event-starts" className={labelClassName}>
            Starts
          </label>
          <input
            id="desk-event-starts"
            name="startsAt"
            type="datetime-local"
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="desk-event-ends" className={labelClassName}>
            Ends
          </label>
          <input
            id="desk-event-ends"
            name="endsAt"
            type="datetime-local"
            className={fieldClassName}
          />
        </div>
      </div>

      <div>
        <label htmlFor="desk-event-location" className={labelClassName}>
          Location
        </label>
        <input
          id="desk-event-location"
          name="location"
          className={fieldClassName}
          placeholder="Zoom, WhatsApp, or place"
        />
      </div>

      <div>
        <label htmlFor="desk-event-notes" className={labelClassName}>
          Notes
        </label>
        <textarea
          id="desk-event-notes"
          name="notes"
          rows={3}
          className={fieldClassName}
          placeholder="Agenda or prep"
        />
      </div>

      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending || !projectId}>
        {pending ? "Saving…" : "Add event"}
      </Button>
    </form>
  );
}
