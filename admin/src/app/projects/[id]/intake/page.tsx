import PortalIntakePage from "@/app/portal/projects/[id]/intake/page";
import { shouldServePortalUi } from "@/lib/serve-portal";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
};

/** Soft-nav alias: Portal discovery lives under the public `/projects/[id]/intake` URL. */
export default async function ProjectIntakeAliasPage(props: Props) {
  if (!(await shouldServePortalUi())) {
    notFound();
  }
  return <PortalIntakePage {...props} />;
}
