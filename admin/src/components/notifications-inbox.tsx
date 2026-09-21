import Link from "next/link";
import { buttonClassName } from "@/components/ui/button";
import { ConfirmDelete } from "@/components/confirm-submit";
import {
  EditLink,
  TableActionsCell,
  TableActionsHeader,
} from "@/components/table-actions";
import { notificationKindLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { snippet } from "@/lib/text";
import { tableClassName, TableFrame } from "@/lib/tables";
import { cn } from "@/lib/utils";
import type { NotificationKind } from "@/db/schema";

export type NotificationListItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
  createdByUserId: string | null;
};

export type NotificationsView = "feed" | "table";

function formatWhen(value: Date) {
  return value.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatWhenShort(value: Date) {
  return value.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function canEditItem(
  item: NotificationListItem,
  allowEdit: boolean,
  currentUserId: string | null,
) {
  return (
    allowEdit &&
    Boolean(currentUserId) &&
    item.createdByUserId === currentUserId
  );
}

function ViewSwitcher({
  basePath,
  view,
}: {
  basePath: string;
  view: NotificationsView;
}) {
  const feedHref = basePath;
  const tableHref = `${basePath}?view=table`;

  return (
    <div
      className="inline-flex overflow-hidden rounded-lg border border-gray-200 bg-white text-sm"
      role="group"
      aria-label="Notification layout"
    >
      <Link
        href={feedHref}
        className={cn(
          "px-3 py-1.5 font-medium transition-colors",
          view === "feed"
            ? "bg-dark-950 text-white"
            : "text-gray-600 hover:bg-gray-50 hover:text-dark-950",
        )}
        aria-current={view === "feed" ? "page" : undefined}
      >
        Feed
      </Link>
      <Link
        href={tableHref}
        className={cn(
          "border-l border-gray-200 px-3 py-1.5 font-medium transition-colors",
          view === "table"
            ? "bg-dark-950 text-white"
            : "text-gray-600 hover:bg-gray-50 hover:text-dark-950",
        )}
        aria-current={view === "table" ? "page" : undefined}
      >
        Table
      </Link>
    </div>
  );
}

function NotificationActions({
  item,
  editHref,
  markReadAction,
  deleteAction,
  allowEdit,
  currentUserId,
  compact = false,
}: {
  item: NotificationListItem;
  editHref?: (id: string) => string;
  markReadAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  allowEdit: boolean;
  currentUserId: string | null;
  compact?: boolean;
}) {
  const unreadItem = !item.readAt;
  const showEdit = canEditItem(item, allowEdit, currentUserId) && editHref;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1",
        compact ? "justify-end text-sm" : "text-sm",
      )}
    >
      {showEdit ? <EditLink href={editHref(item.id)} /> : null}
      <form action={markReadAction}>
        <input type="hidden" name="id" value={item.id} />
        <input type="hidden" name="read" value={unreadItem ? "1" : "0"} />
        <button type="submit" className={linkClassName("back")}>
          {unreadItem ? "Mark read" : "Mark unread"}
        </button>
      </form>
      <form action={deleteAction}>
        <input type="hidden" name="id" value={item.id} />
        <ConfirmDelete
          label="Delete"
          size="sm"
          message="Removes it from this inbox. Emails already sent are unaffected."
        />
      </form>
    </div>
  );
}

function FeedView({
  items,
  editHref,
  markReadAction,
  deleteAction,
  allowEdit,
  currentUserId,
}: {
  items: NotificationListItem[];
  editHref?: (id: string) => string;
  markReadAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  allowEdit: boolean;
  currentUserId: string | null;
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const unreadItem = !item.readAt;

        return (
          <li key={item.id}>
            <article
              className={cn(
                "relative overflow-hidden rounded-xl border bg-white",
                unreadItem
                  ? "border-gray-200 shadow-sm"
                  : "border-gray-200/80",
              )}
            >
              <div
                className={cn(
                  "absolute inset-y-0 left-0 w-1",
                  unreadItem ? "bg-gold-500" : "bg-transparent",
                )}
                aria-hidden="true"
              />
              <div className="flex flex-col gap-3 px-4 py-4 pl-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-5">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                    <span className="font-medium text-gray-700">
                      {notificationKindLabel(item.kind)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={item.createdAt.toISOString()}>
                      {formatWhen(item.createdAt)}
                    </time>
                    {unreadItem ? (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-gold-600">New</span>
                      </>
                    ) : null}
                  </div>
                  <h2
                    className={cn(
                      "text-base leading-snug text-dark-950",
                      unreadItem ? "font-semibold" : "font-medium",
                    )}
                  >
                    {item.href ? (
                      <Link href={item.href} className="hover:text-gold-600">
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </h2>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-600">
                    {item.body}
                  </p>
                </div>
                <NotificationActions
                  item={item}
                  editHref={editHref}
                  markReadAction={markReadAction}
                  deleteAction={deleteAction}
                  allowEdit={allowEdit}
                  currentUserId={currentUserId}
                />
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

function TableView({
  items,
  editHref,
  markReadAction,
  deleteAction,
  allowEdit,
  currentUserId,
}: {
  items: NotificationListItem[];
  editHref?: (id: string) => string;
  markReadAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  allowEdit: boolean;
  currentUserId: string | null;
}) {
  return (
    <TableFrame>
      <table className={tableClassName}>
        <thead>
          <tr>
            <th className="w-10 px-4 py-3 font-medium">
              <span className="sr-only">Status</span>
            </th>
            <th className="px-4 py-3 font-medium">When</th>
            <th className="px-4 py-3 font-medium">Kind</th>
            <th className="px-4 py-3 font-medium">Notice</th>
            <TableActionsHeader />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const unreadItem = !item.readAt;

            return (
              <tr
                key={item.id}
                {...(unreadItem ? { "data-current": "" } : {})}
              >
                <td className="px-4 py-3 align-middle">
                  <span
                    className={cn(
                      "inline-block h-2 w-2 rounded-full",
                      unreadItem ? "bg-gold-500" : "bg-gray-200",
                    )}
                    title={unreadItem ? "Unread" : "Read"}
                    aria-label={unreadItem ? "Unread" : "Read"}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                  <time dateTime={item.createdAt.toISOString()}>
                    {formatWhenShort(item.createdAt)}
                  </time>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-gray-700">
                  {notificationKindLabel(item.kind)}
                </td>
                <td className="px-4 py-3">
                  <div className="min-w-0 space-y-0.5">
                    <div
                      className={cn(
                        "text-dark-950",
                        unreadItem ? "font-semibold" : "font-medium",
                      )}
                    >
                      {item.href ? (
                        <Link
                          href={item.href}
                          className={linkClassName("table")}
                        >
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </div>
                    <p className="text-gray-600">{snippet(item.body, 100)}</p>
                  </div>
                </td>
                <TableActionsCell>
                  <NotificationActions
                    item={item}
                    editHref={editHref}
                    markReadAction={markReadAction}
                    deleteAction={deleteAction}
                    allowEdit={allowEdit}
                    currentUserId={currentUserId}
                    compact
                  />
                </TableActionsCell>
              </tr>
            );
          })}
        </tbody>
      </table>
    </TableFrame>
  );
}

export function NotificationsInbox({
  items,
  newHref,
  editHref,
  markReadAction,
  deleteAction,
  emptyLabel,
  allowEdit = false,
  currentUserId = null,
  allowCompose = true,
  view = "feed",
  basePath = "/notifications",
}: {
  items: NotificationListItem[];
  newHref?: string;
  editHref?: (id: string) => string;
  markReadAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  emptyLabel: string;
  /** Desk only: show Edit when the signed-in user created the notice. */
  allowEdit?: boolean;
  currentUserId?: string | null;
  allowCompose?: boolean;
  view?: NotificationsView;
  basePath?: string;
}) {
  const unread = items.filter((item) => !item.readAt).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-heading">Notifications</h1>
          <p className="mt-2 text-sm text-gray-600">
            {unread > 0
              ? `${unread} unread · alerts that sit with your email updates.`
              : "Alerts that sit with your email updates."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ViewSwitcher basePath={basePath} view={view} />
          {allowCompose && newHref ? (
            <Link href={newHref} className={buttonClassName("default", "sm")}>
              New notice
            </Link>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
          <p className="text-sm text-gray-500">{emptyLabel}</p>
        </div>
      ) : view === "table" ? (
        <TableView
          items={items}
          editHref={editHref}
          markReadAction={markReadAction}
          deleteAction={deleteAction}
          allowEdit={allowEdit}
          currentUserId={currentUserId}
        />
      ) : (
        <FeedView
          items={items}
          editHref={editHref}
          markReadAction={markReadAction}
          deleteAction={deleteAction}
          allowEdit={allowEdit}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}

export function parseNotificationsView(
  value: string | string[] | undefined,
): NotificationsView {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw === "table" ? "table" : "feed";
}
