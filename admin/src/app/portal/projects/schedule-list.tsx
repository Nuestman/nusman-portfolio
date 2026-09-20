import type { ReactNode } from "react";
import Link from "next/link";
import { ConfirmClick } from "@/components/confirm-submit";
import { buttonClassName } from "@/components/ui/button";
import type { ProjectEventKind, ProjectEventStatus } from "@/db/schema";
import {
  projectEventKindLabel,
  projectEventStatusLabel,
} from "@/lib/labels";
import { displayText, formatEventWhen } from "@/lib/text";
import { linkClassName } from "@/lib/links";
import {
  confirmPortalEventAction,
  cancelPortalEventAction,
  declinePortalEventAction,
} from "./actions";

export type PortalScheduleEvent = {
  id: string;
  projectId: string;
  projectTitle?: string;
  kind: ProjectEventKind;
  title: string;
  status: ProjectEventStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  location: string | null;
  notes: string | null;
};

function EventFields({
  event,
  returnTo,
}: {
  event: PortalScheduleEvent;
  returnTo?: string;
}) {
  return (
    <>
      <input type="hidden" name="id" value={event.id} />
      <input type="hidden" name="projectId" value={event.projectId} />
      {returnTo ? <input type="hidden" name="next" value={returnTo} /> : null}
    </>
  );
}

function EventActions({
  event,
  returnTo,
}: {
  event: PortalScheduleEvent;
  returnTo?: string;
}) {
  const canCancel =
    event.status === "requested" ||
    event.status === "proposed" ||
    event.status === "confirmed";

  if (event.status !== "proposed" && !canCancel) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {event.status === "proposed" ? (
        <>
          <form action={confirmPortalEventAction}>
            <EventFields event={event} returnTo={returnTo} />
            <ConfirmClick
              message={`Confirm “${event.title}”?`}
              confirmLabel="Confirm"
              className={buttonClassName("default", "sm")}
            >
              Confirm
            </ConfirmClick>
          </form>
          <form action={declinePortalEventAction}>
            <EventFields event={event} returnTo={returnTo} />
            <ConfirmClick
              message={`Decline “${event.title}”? Usman will see it was cancelled.`}
              confirmLabel="Decline"
              title="Decline"
              className={buttonClassName("outline", "sm")}
            >
              Decline
            </ConfirmClick>
          </form>
        </>
      ) : canCancel ? (
        <form action={cancelPortalEventAction}>
          <EventFields event={event} returnTo={returnTo} />
          <ConfirmClick
            message={`Cancel “${event.title}”?`}
            confirmLabel="Cancel appointment"
            title="Cancel appointment"
            className={buttonClassName("outline", "sm")}
          >
            Cancel
          </ConfirmClick>
        </form>
      ) : null}
    </div>
  );
}

function openEventCardClass(status: ProjectEventStatus): string {
  switch (status) {
    case "requested":
    case "proposed":
      return "rounded-xl border border-amber-300 bg-amber-50 px-4 py-4";
    case "confirmed":
    case "completed":
    case "cancelled":
      return "rounded-xl border border-gray-200 px-4 py-4";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function PortalScheduleList({
  events,
  showProject = false,
  returnTo,
  empty,
}: {
  events: PortalScheduleEvent[];
  showProject?: boolean;
  returnTo?: string;
  empty?: ReactNode;
}) {
  if (events.length === 0) {
    return (
      empty ?? (
        <p className="text-sm text-gray-600">
          No meetings yet. Request one below, or wait for Usman to propose a
          time.
        </p>
      )
    );
  }

  const open = events.filter(
    (event) =>
      event.status === "proposed" ||
      event.status === "confirmed" ||
      event.status === "requested",
  );
  const closed = events.filter(
    (event) =>
      event.status === "cancelled" || event.status === "completed",
  );

  return (
    <div className="space-y-6">
      {open.length === 0 ? (
        empty ?? (
          <p className="text-sm text-gray-600">Nothing upcoming right now.</p>
        )
      ) : (
        <ul className="space-y-4">
          {open.map((event) => {
            return (
              <li key={event.id} className={openEventCardClass(event.status)}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    {showProject && event.projectTitle ? (
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        <Link
                          href={`/projects/${event.projectId}`}
                          className={linkClassName("nav")}
                        >
                          {event.projectTitle}
                        </Link>
                      </p>
                    ) : null}
                    <p
                      className={
                        showProject && event.projectTitle
                          ? "mt-1 text-xs font-medium uppercase tracking-wide text-gray-500"
                          : "text-xs font-medium uppercase tracking-wide text-gray-500"
                      }
                    >
                      {projectEventKindLabel(event.kind)} ·{" "}
                      {projectEventStatusLabel(event.status)}
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
                    {event.status === "proposed" ? (
                      <p className="mt-2 text-sm text-amber-950">
                        Usman proposed this time. Confirm or decline.
                      </p>
                    ) : null}
                    {event.status === "requested" ? (
                      <p className="mt-2 text-sm text-amber-950">
                        Waiting for Usman to set a firm time. You can cancel
                        this request.
                      </p>
                    ) : null}
                    {event.status === "confirmed" ? (
                      <p className="mt-2 text-sm text-gray-600">
                        This is booked. Cancel if you need to reschedule.
                      </p>
                    ) : null}
                  </div>
                  <EventActions event={event} returnTo={returnTo} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {closed.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
            Past
          </p>
          <ul className="space-y-3">
            {closed.map((event) => (
              <li
                key={event.id}
                className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600"
              >
                {showProject && event.projectTitle ? (
                  <>
                    <span className="font-medium text-dark-950">
                      {event.projectTitle}
                    </span>
                    {" · "}
                  </>
                ) : null}
                <span className="font-medium text-dark-950">{event.title}</span>
                {" · "}
                {projectEventStatusLabel(event.status)}
                {" · "}
                {formatEventWhen(event.startsAt)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
