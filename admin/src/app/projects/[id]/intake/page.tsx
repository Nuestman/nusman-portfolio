import type { Metadata } from "next";
import PortalIntakePage from "@/app/portal/projects/[id]/intake/page";
import { getPortalSessionPerson } from "@/lib/current-person";
import { isUuid } from "@/lib/ids";
import { shouldServePortalUi } from "@/lib/serve-portal";
import { dualModeMetadata } from "@/lib/surface-meta";
import { getPortalProjectForPerson } from "@/db/queries";
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
    return dualModeMetadata("Questions");
  }
  const session = await getPortalSessionPerson().catch(() => null);
  if (!session) {
    return dualModeMetadata("Questions");
  }
  const project = await getPortalProjectForPerson(id, session.client.id).catch(
    () => null,
  );
  const label = project?.title ? `${project.title} · Questions` : "Questions";
  return dualModeMetadata(label);
}

/** Soft-nav alias: Portal questions live under the public `/projects/[id]/intake` URL. */
export default async function ProjectIntakeAliasPage(props: Props) {
  if (!(await shouldServePortalUi())) {
    notFound();
  }
  return <PortalIntakePage {...props} />;
}
