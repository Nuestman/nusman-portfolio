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
import { QueryNotice } from "@/components/query-notice";
import { getPortalSessionPerson, requirePortalPerson } from "@/lib/current-person";
import { isUuid } from "@/lib/ids";
import { PAGE_NARROW_CLASS } from "@/lib/layout";
import { optionKindLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";

export const dynamic = "force-dynamic";

type PortalBriefPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
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
  searchParams,
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

  const [discovery, selected, query] = await Promise.all([
    getDiscovery(project.id),
    getSelectedOption(project.id),
    searchParams,
  ]);
  const inScope = discovery?.inScope?.trim() || selected?.inScope || null;
  const outOfScope = discovery?.outOfScope?.trim() || selected?.outOfScope || null;
  const noticeRaw = Array.isArray(query.notice) ? query.notice[0] : query.notice;

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

        {noticeRaw === "saved" ? (
          <QueryNotice message="Brief saved." />
        ) : null}

        <PortalProjectBrief
          projectId={project.id}
          title={project.title}
          canEdit={project.portalIntakeOpen}
          problem={project.problemSentence}
          wantBuilt={project.wantBuilt}
          success={project.successLooksLike}
          inScope={inScope}
          outOfScope={outOfScope}
          deadline={project.deadlineNote}
          packageName={selected ? optionKindLabel(selected.kind) : null}
          whoFor={project.whoFor}
          budgetNote={project.budgetNote}
          notes={project.qualifyNotes}
        />
      </div>
    </PortalShell>
  );
}
