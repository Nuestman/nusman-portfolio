import PortalSchedulePage from "@/app/portal/projects/[id]/schedule/page";
import { shouldServePortalUi } from "@/lib/serve-portal";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

/** Soft-nav alias: Portal schedule lives under the public `/projects/[id]/schedule` URL. */
export default async function ProjectScheduleAliasPage(props: Props) {
  if (!(await shouldServePortalUi())) {
    notFound();
  }
  return <PortalSchedulePage {...props} />;
}
