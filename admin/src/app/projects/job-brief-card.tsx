import { EditableCard } from "@/components/editable-card";
import { displayText } from "@/lib/text";
import { projectStatusLabel } from "@/lib/labels";
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
    successLooksLike: string | null;
    budgetNote: string | null;
    deadlineNote: string | null;
    status: ProjectStatus;
  };
  locked?: boolean;
}) {
  const problem = project.problemSentence?.trim() ?? "";
  const success = project.successLooksLike?.trim() ?? "";
  const deadline = project.deadlineNote?.trim() ?? "";

  return (
    <EditableCard
      title={isProduct ? "Product details" : "Brief"}
      hint={
        locked
          ? "Brief is frozen while this job is disqualified."
          : isProduct
            ? undefined
            : "Locked problem and success for this job. Needed before you leave Discover."
      }
      showEdit={!locked}
      view={
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Problem
            </p>
            {problem ? (
              <p className="mt-2 font-heading text-2xl leading-snug text-dark-950 sm:text-3xl">
                {problem}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-600">
                No problem sentence yet. Edit to write the one-line lock, or save
                discovery answers first.
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Success looks like
            </p>
            {success ? (
              <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-gray-800">
                {success}
              </p>
            ) : (
              <p className="mt-2 text-sm text-gray-600">
                Not set. How will you both know this worked?
              </p>
            )}
          </div>

          <dl className="grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Deadline
              </dt>
              <dd className="mt-1 text-sm text-gray-800">
                {displayText(deadline || null)}
              </dd>
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
              successLooksLike: project.successLooksLike ?? "",
              budgetNote: project.budgetNote ?? "",
              deadlineNote: project.deadlineNote ?? "",
              status: project.status,
            }}
            problemHint={
              isProduct ? undefined : "Needed before you leave Discover."
            }
            hideBudget={!isProduct}
          />
        )
      }
    />
  );
}
