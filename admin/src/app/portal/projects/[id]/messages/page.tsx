import { redirect } from "next/navigation";
import { isUuid } from "@/lib/ids";

export const dynamic = "force-dynamic";

type LegacyPortalMessagesProps = {
  params: Promise<{ id: string }>;
};

/** Old deep link — keep working by sending people to the inbox thread. */
export default async function LegacyPortalProjectMessagesPage({
  params,
}: LegacyPortalMessagesProps) {
  const { id } = await params;
  if (!isUuid(id)) {
    redirect("/messages");
  }
  redirect(`/messages/${id}`);
}
