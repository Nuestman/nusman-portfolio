import type { Metadata } from "next";
import PortalSchedulePage from "@/app/portal/projects/[id]/schedule/page";
import { getPortalProjectForPerson } from "@/db/queries";
import { getPortalSessionPerson } from "@/lib/current-person";
import { isUuid } from "@/lib/ids";
import { shouldServePortalUi } from "@/lib/serve-portal";
import { dualModeMetadata } from "@/lib/surface-meta";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  if (!(await shouldServePortalUi())) {
    return {};
  }
  const { id } = await params;
  if (!isUuid(id)) {
    return dualModeMetadata("Schedule");
  }
  const session = await getPortalSessionPerson().catch(() => null);
  if (!session) {
    return dualModeMetadata("Schedule");
  }
  const project = await getPortalProjectForPerson(id, session.client.id).catch(
    () => null,
  );
  const label = project?.title ? `${project.title} · Schedule` : "Schedule";
  return dualModeMetadata(label);
}

/** Soft-nav alias: Portal schedule lives under the public `/projects/[id]/schedule` URL. */
export default async function ProjectScheduleAliasPage(props: Props) {
  if (!(await shouldServePortalUi())) {
    notFound();
  }
  return <PortalSchedulePage {...props} />;
}
