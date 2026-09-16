import Link from "next/link";
import { ConfirmClick, ConfirmDelete } from "@/components/confirm-submit";
import { EditableCard } from "@/components/editable-card";
import { EditLink } from "@/components/table-actions";
import { buttonClassName } from "@/components/ui/button";
import type { ProjectEventKind, ProjectEventStatus } from "@/db/schema";
import {
  projectEventKindLabel,
  projectEventStatusLabel,
} from "@/lib/labels";
import { displayText, formatEventWhen } from "@/lib/text";
import {
  deleteProjectEventAction,
  setProjectEventStatusAction,
} from "./actions";
import { ProjectEventForm } from "./event-form";

type ScheduleEvent = {
  id: string;
  kind: ProjectEventKind;
  title: string;
  status: ProjectEventStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  location: string | null;
  notes: string | null;
};

function StatusAction({
  eventId,
  projectId,
  status,
  label,
  message,
}: {
  eventId: string;
  projectId: string;
  status: ProjectEventStatus;
  label: string;
  message: string;
}) {
  return (
    <form action={setProjectEventStatusAction}>
      <input type="hidden" name="id" value={eventId} />
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="status" value={status} />
      <ConfirmClick
        message={message}
        confirmLabel={label}
        className={buttonClassName("outline", "sm")}
      >
        {label}
      </ConfirmClick>
    </form>
  );
}

function sortEvents(events: ScheduleEvent[]): ScheduleEvent[] {
  const rank = (status: ProjectEventStatus): number => {
    switch (status) {
      case "requested":
        return 0;
      case "proposed":
        return 1;
      case "confirmed":
        return 2;
      case "completed":
        return 3;
      case "cancelled":
        return 4;
      default: {
        const _exhaustive: never = status;
        return _exhaustive;
      }
    }
  };
  return [...events].sort((a, b) => {
    const byStatus = rank(a.status) - rank(b.status);
    if (byStatus !== 0) {
      return byStatus;
    }
    const aTime = a.startsAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bTime = b.startsAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });
}

export function SchedulePanel({
  projectId,
  events,
  locked = false,
}: {
  projectId: string;
  events: ScheduleEvent[];
  locked?: boolean;
}) {
  const ordered = sortEvents(events);
  const requestCount = events.filter(
    (event) => event.status === "requested",
  ).length;

  return (
    <EditableCard
      title="Schedule"
      hint={
        locked
          ? "Schedule is frozen while this job is closed."
          : "Client requests and proposed times also show on Desk → Schedule. Add here for this job; clients confirm on Portal."
      }
      editLabel="Add"
      showEdit={!locked}
      always={
        <>
          {requestCount > 0 && !locked ? (
            <p className="rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-950">
              {requestCount === 1
                ? "1 client meeting request waiting for a time from you."
                : `${requestCount} client meeting requests waiting for a time from you.`}
            </p>
          ) : null}
          {ordered.length === 0 ? (
            <p className="text-sm text-gray-600">No events yet.</p>
          ) : (
            <ul className="space-y-4">
              {ordered.map((event) => {
                const isRequest = event.status === "requested";
                return (
                  <li
                    key={event.id}
                    className={
                      isRequest
                        ? "rounded-xl border border-amber-300 bg-amber-50 px-4 py-4"
                        : "rounded-xl border border-gray-200 px-4 py-4"
                    }
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          {projectEventKindLabel(event.kind)} ·{" "}
                          {projectEventStatusLabel(event.status)}
                          {isRequest ? " · from client" : null}
                        </p>
                        <p className="mt-1 font-heading text-xl text-dark-950">
                          {event.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-700">
                          {formatEventWhen(event.startsAt)}
                          {event.endsAt
                            ? ` → ${formatEventWhen(event.endsAt)}`
                            : null}
                        </p>
                        {event.location ? (
                          <p className="mt-1 text-sm text-gray-600">
                            {event.location}
                          </p>
                        ) : null}
                        {event.notes ? (
                          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                            {displayText(event.notes)}
                          </p>
                        ) : null}
                        {isRequest && !locked ? (
                          <p className="mt-2 text-sm text-amber-950">
                            Respond: set a start time, change status to{" "}
                            <span className="font-medium">Proposed</span>, save
                            — the client can then confirm on Portal.
                          </p>
                        ) : null}
                      </div>
                      {!locked ? (
                        <div className="flex flex-wrap items-center justify-end gap-3">
                          {isRequest ? (
                            <Link
                              href={`/projects/${projectId}/events/${event.id}/edit`}
                              className={buttonClassName("default", "sm")}
                            >
                              Propose time
                            </Link>
                          ) : (
                            <EditLink
                              href={`/projects/${projectId}/events/${event.id}/edit`}
                            />
                          )}
                          {event.status === "proposed" ? (
                            <StatusAction
                              eventId={event.id}
                              projectId={projectId}
                              status="confirmed"
                              label="Confirm"
                              message={`Confirm “${event.title}”?`}
                            />
                          ) : null}
                          {event.status === "confirmed" ? (
                            <StatusAction
                              eventId={event.id}
                              projectId={projectId}
                              status="completed"
                              label="Done"
                              message={`Mark “${event.title}” completed?`}
                            />
                          ) : null}
                          {event.status !== "cancelled" &&
                          event.status !== "completed" ? (
                            <StatusAction
                              eventId={event.id}
                              projectId={projectId}
                              status="cancelled"
                              label="Cancel"
                              message={`Cancel “${event.title}”?`}
                            />
                          ) : null}
                          <form action={deleteProjectEventAction}>
                            <input type="hidden" name="id" value={event.id} />
                            <input
                              type="hidden"
                              name="projectId"
                              value={projectId}
                            />
                            <ConfirmDelete
                              label="Remove"
                              message={`Remove “${event.title}” from the schedule?`}
                            />
                          </form>
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      }
      form={
        locked ? undefined : (
          <ProjectEventForm projectId={projectId} submitLabel="Add event" />
        )
      }
    />
  );
}
