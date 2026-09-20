import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getDiscovery,
  getPortalProjectForPerson,
  getSelectedOption,
} from "@/db/queries";
import { PortalProjectBrief } from "@/components/portal-project-brief";
import { PortalShell } from "@/components/portal-shell";
import { Card, CardContent } from "@/components/ui/card";
import { getPortalSessionPerson, requirePortalPerson } from "@/lib/current-person";
import { isUuid } from "@/lib/ids";
import { PAGE_NARROW_CLASS } from "@/lib/layout";
import { optionKindLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";

export const dynamic = "force-dynamic";

type PortalBriefPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isUuid(id)) {
    return { title: "Project brief" };
  }
  const session = await getPortalSessionPerson().catch(() => null);
  if (!session) {
    return { title: "Project brief" };
  }
  const project = await getPortalProjectForPerson(id, session.client.id).catch(
    () => null,
  );
  return {
    title: project?.title ? `${project.title} · Brief` : "Project brief",
  };
}

export default async function PortalBriefPage({
  params,
}: PortalBriefPageProps) {
  const { id } = await params;
  if (!isUuid(id)) {
    notFound();
  }

  const { client } = await requirePortalPerson();
  const project = await getPortalProjectForPerson(id, client.id);
  if (!project) {
    notFound();
  }

  const [discovery, selected] = await Promise.all([
    getDiscovery(project.id),
    getSelectedOption(project.id),
  ]);
  const inScope = discovery?.inScope?.trim() || selected?.inScope || null;
  const outOfScope = discovery?.outOfScope?.trim() || selected?.outOfScope || null;

  return (
    <PortalShell>
      <div className={`${PAGE_NARROW_CLASS} space-y-8`}>
        <div>
          <Link
            href={`/projects/${project.id}`}
            className={linkClassName("back")}
          >
            ← {project.title}
          </Link>
          <h1 className="mt-3 section-heading">Project brief</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <PortalProjectBrief
              problem={project.problemSentence}
              success={project.successLooksLike}
              inScope={inScope}
              outOfScope={outOfScope}
              deadline={project.deadlineNote}
              packageName={selected ? optionKindLabel(selected.kind) : null}
            />
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
