import { listDeskNotifications } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import {
  NotificationsInbox,
  parseNotificationsView,
} from "@/components/notifications-inbox";
import { requireSessionUser } from "@/lib/current-user";
import {
  deleteDeskNotificationAction,
  markDeskNotificationReadAction,
} from "./actions";

export const dynamic = "force-dynamic";

type NotificationsPageProps = {
  searchParams: Promise<{ view?: string | string[] }>;
};

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const user = await requireSessionUser();
  const query = await searchParams;
  const view = parseNotificationsView(query.view);
  const items = await listDeskNotifications(user.id);

  return (
    <DeskShell>
      <NotificationsInbox
        items={items}
        newHref="/notifications/new"
        editHref={(id) => `/notifications/${id}/edit`}
        markReadAction={markDeskNotificationReadAction}
        deleteAction={deleteDeskNotificationAction}
        emptyLabel="Nothing here yet. Stage moves, messages, and schedule updates will land here."
        allowEdit
        currentUserId={user.id}
        allowCompose
        view={view}
        basePath="/notifications"
      />
    </DeskShell>
  );
}
