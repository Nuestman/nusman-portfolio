"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  dateFnsLocalizer,
  type EventProps,
  type View,
} from "react-big-calendar";
import { format, getDay, parse, startOfWeek } from "date-fns";
import { enUS } from "date-fns/locale";
import type { ProjectEventStatus } from "@/db/schema";
import { cn } from "@/lib/utils";
import { buttonClassName } from "@/components/ui/button";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

export type ScheduleCalendarEvent = {
  id: string;
  projectId: string;
  title: string;
  status: ProjectEventStatus;
  startsAt: string | null;
  endsAt: string | null;
  projectTitle?: string;
  clientName?: string;
  href?: string | null;
};

type CalendarRow = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: ScheduleCalendarEvent;
};

function toCalendarRows(events: ScheduleCalendarEvent[]): CalendarRow[] {
  const rows: CalendarRow[] = [];
  for (const event of events) {
    if (!event.startsAt) {
      continue;
    }
    if (event.status === "cancelled") {
      continue;
    }
    const start = new Date(event.startsAt);
    if (Number.isNaN(start.getTime())) {
      continue;
    }
    const end = event.endsAt
      ? new Date(event.endsAt)
      : new Date(start.getTime() + 60 * 60 * 1000);
    const label = event.clientName
      ? `${event.title} · ${event.clientName}`
      : event.projectTitle
        ? `${event.title} · ${event.projectTitle}`
        : event.title;
    rows.push({
      id: event.id,
      title: label,
      start,
      end: Number.isNaN(end.getTime())
        ? new Date(start.getTime() + 60 * 60 * 1000)
        : end,
      resource: event,
    });
  }
  return rows;
}

function eventClassName(status: ProjectEventStatus): string {
  switch (status) {
    case "requested":
      return "nusman-cal-event-requested";
    case "proposed":
      return "nusman-cal-event-proposed";
    case "confirmed":
      return "nusman-cal-event-confirmed";
    case "completed":
      return "nusman-cal-event-completed";
    case "cancelled":
      return "nusman-cal-event-cancelled";
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}

function EventChip({ event }: EventProps<CalendarRow>) {
  return (
    <span className="block truncate px-1 text-xs font-medium">
      {event.title}
    </span>
  );
}

export function ScheduleViewSwitcher({
  events,
  list,
  createForm,
  createLabel = "Add",
  untimedNote,
}: {
  events: ScheduleCalendarEvent[];
  list: ReactNode;
  createForm?: ReactNode;
  createLabel?: string;
  untimedNote?: ReactNode;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"list" | "calendar">("list");
  const [creating, setCreating] = useState(false);
  const [calView, setCalView] = useState<View>("month");
  const [calDate, setCalDate] = useState(() => new Date());

  const rows = useMemo(() => toCalendarRows(events), [events]);
  const untimed = useMemo(
    () =>
      events.filter(
        (event) =>
          !event.startsAt &&
          (event.status === "requested" ||
            event.status === "proposed" ||
            event.status === "confirmed"),
      ),
    [events],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex rounded-lg border border-gray-200 bg-white p-1"
          role="group"
          aria-label="Schedule view"
        >
          <button
            type="button"
            className={cn(
              buttonClassName(mode === "list" ? "default" : "ghost", "sm"),
              "rounded-md",
            )}
            aria-pressed={mode === "list"}
            onClick={() => setMode("list")}
          >
            Cards
          </button>
          <button
            type="button"
            className={cn(
              buttonClassName(
                mode === "calendar" ? "default" : "ghost",
                "sm",
              ),
              "rounded-md",
            )}
            aria-pressed={mode === "calendar"}
            onClick={() => setMode("calendar")}
          >
            Calendar
          </button>
        </div>
        {createForm ? (
          <button
            type="button"
            className={buttonClassName(
              creating ? "secondary" : "default",
              "sm",
            )}
            aria-expanded={creating}
            onClick={() => setCreating((current) => !current)}
          >
            {creating ? "Cancel" : createLabel}
          </button>
        ) : null}
      </div>

      {creating && createForm ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6">
          {createForm}
        </div>
      ) : null}

      {mode === "list" ? (
        list
      ) : (
        <div className="space-y-4">
          {untimed.length > 0 ? (
            <div className="rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-950">
              {untimedNote ?? (
                <p>
                  {untimed.length === 1
                    ? "1 item has no start time yet — it stays on Cards until a time is set."
                    : `${untimed.length} items have no start time yet — they stay on Cards until a time is set.`}
                </p>
              )}
            </div>
          ) : null}
          <div className="nusman-calendar overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 sm:p-4">
            <Calendar
              localizer={localizer}
              events={rows}
              view={calView}
              onView={setCalView}
              date={calDate}
              onNavigate={setCalDate}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 640 }}
              popup
              components={{ event: EventChip }}
              eventPropGetter={(event) => ({
                className: eventClassName(event.resource.status),
              })}
              onSelectEvent={(event) => {
                const href = event.resource.href;
                if (href) {
                  router.push(href);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
