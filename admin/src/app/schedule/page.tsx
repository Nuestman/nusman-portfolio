import Link from "next/link";
import { loadFromDb } from "@/db";
import {
  listActiveProjects,
  listClients,
  listDeskScheduleEvents,
  listPeopleByClientIds,
} from "@/db/queries";
import { ConfirmClick } from "@/components/confirm-submit";
import { DatabaseNotice } from "@/components/database-notice";
import { DeskShell } from "@/components/desk-shell";
import { ScheduleViewSwitcher } from "@/components/schedule/schedule-view-switcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonClassName } from "@/components/ui/button";
import { linkClassName } from "@/lib/links";
import {
  projectEventKindLabel,
  projectEventStatusLabel,
} from "@/lib/labels";
import { displayText, formatEventWhen } from "@/lib/text";
import type { ProjectEventStatus } from "@/db/schema";
import { setProjectEventStatusAction } from "@/app/projects/actions";
import { DeskScheduleCreateForm } from "./create-form";

export const dynamic = "force-dynamic";

function statusRank(status: ProjectEventStatus): number {
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
}

export default async function DeskSchedulePage() {
  const loaded = await loadFromDb(async () => {
    const [events, projects, clients] = await Promise.all([
      listDeskScheduleEvents(),
      listActiveProjects(),
      listClients(),
    ]);
    const people = await listPeopleByClientIds(
      clients.map((client) => client.id),
    );
    return { events, projects, clients, people };
  });

  return (
    <DeskShell>
      <div>
        <h1 className="section-heading">Schedule</h1>
        <p className="mt-2 max-w-2xl text-gray-700">
          All meetings and calls across hiring projects. Pick client, project,
          and person when you add one.
        </p>
      </div>

      {loaded.kind === "missing" || loaded.kind === "error" ? (
        <DatabaseNotice kind={loaded.kind} noun="schedule" />
      ) : (
        (() => {
          const events = [...loaded.data.events].sort((a, b) => {
            const byStatus = statusRank(a.status) - statusRank(b.status);
            if (byStatus !== 0) {
              return byStatus;
            }
            const aTime = a.startsAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
            const bTime = b.startsAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
            return aTime - bTime;
          });
          const requests = events.filter(
            (event) => event.status === "requested",
          );
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
          const calendarEvents = events.map((event) => ({
            id: event.id,
            projectId: event.projectId,
            title: event.title,
            status: event.status,
            startsAt: event.startsAt?.toISOString() ?? null,
            endsAt: event.endsAt?.toISOString() ?? null,
            projectTitle: event.projectTitle,
            clientName: event.clientName,
            href: `/projects/${event.projectId}/events/${event.id}/edit`,
          }));
          const createClients = loaded.data.clients.map((client) => ({
            id: client.id,
            name: client.name,
          }));
          const createProjects = loaded.data.projects.map((project) => ({
            id: project.id,
            title: project.title,
            clientId: project.clientId,
          }));
          const createPeople = loaded.data.people.map((person) => ({
            id: person.id,
            name: person.name,
            clientId: person.clientId,
            role: person.role,
          }));

          return (
            <>
              {requests.length > 0 ? (
                <p className="rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-950">
                  {requests.length === 1
                    ? "1 client request waiting for a proposed time."
                    : `${requests.length} client requests waiting for a proposed time.`}
                </p>
              ) : null}

              <ScheduleViewSwitcher
                events={calendarEvents}
                createLabel="Add"
                createForm={
                  <DeskScheduleCreateForm
                    clients={createClients}
                    projects={createProjects}
                    people={createPeople}
                  />
                }
                list={
                  <div className="space-y-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>Upcoming</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {open.length === 0 ? (
                          <p className="text-sm text-gray-600">
                            Nothing scheduled. Tap Add to create one, or wait for
                            a client request.
                          </p>
                        ) : (
                          <ul className="space-y-4">
                            {open.map((event) => {
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
                                        <Link
                                          href={`/clients/${event.clientId}`}
                                          className={linkClassName("nav")}
                                        >
                                          {event.clientName}
                                        </Link>
                                        {" · "}
                                        <Link
                                          href={`/projects/${event.projectId}`}
                                          className={linkClassName("nav")}
                                        >
                                          {event.projectTitle}
                                        </Link>
                                      </p>
                                      <p className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
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
                                    </div>
                                    <div className="flex flex-wrap items-center justify-end gap-3">
                                      {isRequest ? (
                                        <Link
                                          href={`/projects/${event.projectId}/events/${event.id}/edit`}
                                          className={buttonClassName(
                                            "default",
                                            "sm",
                                          )}
                                        >
                                          Propose time
                                        </Link>
                                      ) : (
                                        <Link
                                          href={`/projects/${event.projectId}/events/${event.id}/edit`}
                                          className={linkClassName("back")}
                                        >
                                          Edit
                                        </Link>
                                      )}
                                      <form action={setProjectEventStatusAction}>
                                        <input
                                          type="hidden"
                                          name="id"
                                          value={event.id}
                                        />
                                        <input
                                          type="hidden"
                                          name="projectId"
                                          value={event.projectId}
                                        />
                                        <input
                                          type="hidden"
                                          name="status"
                                          value="cancelled"
                                        />
                                        <ConfirmClick
                                          message={`Cancel “${event.title}”?`}
                                          confirmLabel="Cancel appointment"
                                          title="Cancel appointment"
                                          className={buttonClassName(
                                            "outline",
                                            "sm",
                                          )}
                                        >
                                          Cancel
                                        </ConfirmClick>
                                      </form>
                                      <Link
                                        href={`/projects/${event.projectId}`}
                                        className={linkClassName("back")}
                                      >
                                        Project
                                      </Link>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </CardContent>
                    </Card>

                    {closed.length > 0 ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Past</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-3">
                            {closed.map((event) => (
                              <li
                                key={event.id}
                                className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600"
                              >
                                <Link
                                  href={`/projects/${event.projectId}`}
                                  className={linkClassName("nav")}
                                >
                                  {event.projectTitle}
                                </Link>
                                {" · "}
                                <span className="font-medium text-dark-950">
                                  {event.title}
                                </span>
                                {" · "}
                                {projectEventStatusLabel(event.status)}
                                {" · "}
                                {formatEventWhen(event.startsAt)}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ) : null}
                  </div>
                }
              />
            </>
          );
        })()
      )}
    </DeskShell>
  );
}
