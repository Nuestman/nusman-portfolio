import { EditableCard } from "@/components/editable-card";
import { IncompleteInfoBadge } from "@/components/incomplete-info-badge";
import { MarkedValue } from "@/components/set-mark";
import { isBlank } from "@/lib/text";
import { projectStatusLabel, WANT_BUILT_LABEL } from "@/lib/labels";
import type { ProjectStatus } from "@/db/schema";
import { ProjectDetailsForm } from "./project-details-form";

export function JobBriefCard({
  isProduct,
  project,
  locked = false,
}: {
  isProduct: boolean;
  project: {
    id: string;
    title: string;
    problemSentence: string | null;
    wantBuilt: string | null;
    successLooksLike: string | null;
    budgetNote: string | null;
    deadlineNote: string | null;
    status: ProjectStatus;
  };
  locked?: boolean;
}) {
  const incomplete = [
    project.problemSentence,
    project.successLooksLike,
    project.deadlineNote,
    ...(isProduct ? [] : [project.wantBuilt]),
  ].some(isBlank);

  return (
    <EditableCard
      title={isProduct ? "Product details" : "Brief"}
      badge={incomplete ? <IncompleteInfoBadge /> : undefined}
      hint={
        locked
          ? "Brief is frozen while this job is disqualified."
          : isProduct
            ? undefined
            : "Locked problem, what we're building, and success for this job. Needed before you leave Discover."
      }
      showEdit={!locked}
      view={
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Problem
            </p>
            <MarkedValue value={project.problemSentence} size="lead" />
          </div>

          {isProduct ? null : (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {WANT_BUILT_LABEL}
              </p>
              <MarkedValue value={project.wantBuilt} />
            </div>
          )}

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Success looks like
            </p>
            <MarkedValue value={project.successLooksLike} />
          </div>

          <dl className="grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Deadline
              </dt>
              <MarkedValue
                value={project.deadlineNote}
                size="meta"
                className="mt-1"
              />
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Status
              </dt>
              <dd className="mt-1 text-sm text-gray-800">
                {projectStatusLabel(project.status)}
              </dd>
            </div>
            {isProduct ? (
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Title
                </dt>
                <dd className="mt-1 text-sm text-gray-800">{project.title}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      }
      form={
        locked ? undefined : (
          <ProjectDetailsForm
            project={{
              id: project.id,
              title: project.title,
              problemSentence: project.problemSentence ?? "",
              wantBuilt: project.wantBuilt ?? "",
              successLooksLike: project.successLooksLike ?? "",
              budgetNote: project.budgetNote ?? "",
              deadlineNote: project.deadlineNote ?? "",
              status: project.status,
            }}
            problemHint={
              isProduct ? undefined : "Needed before you leave Discover."
            }
            hideBudget={!isProduct}
            hideWantBuilt={isProduct}
          />
        )
      }
    />
  );
}
