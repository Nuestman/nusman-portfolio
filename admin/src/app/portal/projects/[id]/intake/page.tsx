import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ensureIntakeAnswers,
  getPortalProjectForPerson,
} from "@/db/queries";
import { PortalShell } from "@/components/portal-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QueryNotice } from "@/components/query-notice";
import { requirePortalPerson } from "@/lib/current-person";
import { isUuid } from "@/lib/ids";
import { linkClassName } from "@/lib/links";
import { PortalIntakeForm } from "../../intake-form";

export const dynamic = "force-dynamic";

type PortalIntakePageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string | string[] }>;
};

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
    <PortalShell width="4xl">
      <div>
        <Link
          href={`/projects/${project.id}`}
          className={linkClassName("back")}
        >
          ← {project.title}
        </Link>
        <h1 className="mt-3 section-heading">Intake</h1>
        <p className="mt-2 text-gray-700">
          {project.portalIntakeOpen
            ? "Answer these so discovery stays focused."
            : "Read-only for now."}
        </p>
      </div>

      {noticeRaw === "saved" ? (
        <QueryNotice message="Answers saved." />
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent>
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
            <ul className="space-y-4 text-sm text-gray-700">
              {answers.map((item) => (
                <li key={item.theme}>
                  <p className="font-medium text-dark-950">{item.theme}</p>
                  <p className="text-gray-600">{item.ask}</p>
                  <p className="mt-1 whitespace-pre-wrap">
                    {item.answer?.trim() || "—"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </PortalShell>
  );
}
