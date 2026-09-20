import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ensureIntakeAnswers,
  getPortalProjectForPerson,
} from "@/db/queries";
import { PortalShell } from "@/components/portal-shell";
import { Card, CardContent } from "@/components/ui/card";
import { QueryNotice } from "@/components/query-notice";
import { getPortalSessionPerson, requirePortalPerson } from "@/lib/current-person";
import { isUuid } from "@/lib/ids";
import { PAGE_NARROW_CLASS } from "@/lib/layout";
import { linkClassName } from "@/lib/links";
import { PortalIntakeForm } from "../../intake-form";

export const dynamic = "force-dynamic";

type PortalIntakePageProps = {
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
    return { title: "Questions" };
  }
  const session = await getPortalSessionPerson().catch(() => null);
  if (!session) {
    return { title: "Questions" };
  }
  const project = await getPortalProjectForPerson(id, session.client.id).catch(
    () => null,
  );
  return {
    title: project?.title ? `${project.title} · Questions` : "Questions",
  };
}

export default async function PortalIntakePage({
  params,
  searchParams,
}: PortalIntakePageProps) {
  const { id } = await params;
  if (!isUuid(id)) {
    notFound();
  }

  const { client } = await requirePortalPerson();
  const project = await getPortalProjectForPerson(id, client.id);
  if (!project) {
    notFound();
  }

  const [answers, query] = await Promise.all([
    ensureIntakeAnswers(project.id),
    searchParams,
  ]);
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
          <h1 className="mt-3 section-heading">Questions</h1>
          <p className="mt-2 text-gray-700">
            {project.portalIntakeOpen
              ? "A few questions so we can plan with the right picture."
              : "Usman has closed questions for now."}
          </p>
        </div>

        {noticeRaw === "saved" ? (
          <QueryNotice message="Answers saved." />
        ) : null}

        <Card>
          <CardContent className="pt-6">
            {project.portalIntakeOpen ? (
              <PortalIntakeForm
                projectId={project.id}
                open
                answers={answers.map((item) => ({
                  theme: item.theme,
                  ask: item.ask,
                  answer: item.answer ?? "",
                }))}
              />
            ) : (
              <p className="text-sm text-gray-600">
                See the{" "}
                <Link
                  href={`/projects/${project.id}/brief`}
                  className={linkClassName("inline")}
                >
                  project brief
                </Link>{" "}
                for the locked picture.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalShell>
  );
}
