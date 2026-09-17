import { notFound } from "next/navigation";
import { getNotification } from "@/db/queries";
import { DeskShell } from "@/components/desk-shell";
import { requireSessionUser } from "@/lib/current-user";
import { isUuid } from "@/lib/ids";
import { DeskNotificationEditForm } from "../../notification-edit-form";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditNotificationPage({ params }: PageProps) {
  const user = await requireSessionUser();
  const { id } = await params;
  if (!isUuid(id)) {
    notFound();
  }
  const row = await getNotification(id);
  if (
    !row ||
    row.audience !== "desk" ||
    (row.userId && row.userId !== user.id) ||
    row.createdByUserId !== user.id
  ) {
    notFound();
  }

  return (
    <DeskShell>
      <div className="mb-8">
        <h1 className="section-heading">Edit notice</h1>
        <p className="mt-2 max-w-2xl text-gray-700">
          Update the title, body, or link for this notification.
        </p>
      </div>
      <DeskNotificationEditForm
        id={row.id}
        title={row.title}
        body={row.body}
        href={row.href}
      />
    </DeskShell>
  );
}
