import type { Metadata } from "next";
import PortalBriefPage from "@/app/portal/projects/[id]/brief/page";
import { getPortalProjectForPerson } from "@/db/queries";
import { getPortalSessionPerson } from "@/lib/current-person";
import { isUuid } from "@/lib/ids";
import { shouldServePortalUi } from "@/lib/serve-portal";
import { dualModeMetadata } from "@/lib/surface-meta";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
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
    return dualModeMetadata("Project brief");
  }
  const session = await getPortalSessionPerson().catch(() => null);
  if (!session) {
    return dualModeMetadata("Project brief");
  }
  const project = await getPortalProjectForPerson(id, session.client.id).catch(
    () => null,
  );
  const label = project?.title ? `${project.title} · Brief` : "Project brief";
  return dualModeMetadata(label);
}

/** Soft-nav alias: Portal brief lives under the public `/projects/[id]/brief` URL. */
export default async function ProjectBriefAliasPage(props: Props) {
  if (!(await shouldServePortalUi())) {
    notFound();
  }
  return <PortalBriefPage {...props} />;
}
