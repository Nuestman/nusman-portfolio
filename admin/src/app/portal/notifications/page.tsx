import type { Metadata } from "next";
import { listPortalNotifications } from "@/db/queries";
import {
  NotificationsInbox,
  parseNotificationsView,
} from "@/components/notifications-inbox";
import { PortalShell } from "@/components/portal-shell";
import { requirePortalPerson } from "@/lib/current-person";
import {
  deletePortalNotificationAction,
  markPortalNotificationReadAction,
} from "./actions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifications",
};

type PortalNotificationsPageProps = {
  searchParams: Promise<{ view?: string | string[] }>;
};

export default async function PortalNotificationsPage({
  searchParams,
}: PortalNotificationsPageProps) {
  const { person } = await requirePortalPerson();
  const query = await searchParams;
  const view = parseNotificationsView(query.view);
  const items = await listPortalNotifications(person.id);

  return (
    <PortalShell>
      <NotificationsInbox
        items={items}
        markReadAction={markPortalNotificationReadAction}
        deleteAction={deletePortalNotificationAction}
        emptyLabel="Nothing here yet. Progress and schedule updates will show up here."
        allowEdit={false}
        allowCompose={false}
        view={view}
        basePath="/notifications"
      />
    </PortalShell>
  );
}
