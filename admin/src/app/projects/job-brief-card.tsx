import { EditableCard } from "@/components/editable-card";
import { IncompleteInfoBadge } from "@/components/incomplete-info-badge";
import { MarkedValue } from "@/components/set-mark";
import { cn } from "@/lib/utils";
import { isBlank } from "@/lib/text";
import {
  projectStatusLabel,
  qualifyOutcomeLabel,
  WANT_BUILT_LABEL,
} from "@/lib/labels";
import type { ProjectStatus, QualifyOutcome } from "@/db/schema";
import { ProjectDetailsForm } from "./project-details-form";

function outcomeTone(outcome: QualifyOutcome): string {
  switch (outcome) {
    case "real":
      return "border-gold-500 bg-gold-500 text-white";
    case "favour":
      return "border-gray-300 bg-gray-100 text-gray-800";
    case "no":
      return "border-red-200 bg-red-50 text-red-800";
    case "undecided":
      return "border-amber-300 bg-amber-50 text-amber-950";
    default: {
      const _exhaustive: never = outcome;
      return _exhaustive;
    }
  }
}

export function JobBriefCard({
  isProduct,
  project,
  locked = false,
  defaultEditing = false,
}: {
  isProduct: boolean;
  project: {
    id: string;
    title: string;
    problemSentence: string | null;
    wantBuilt: string | null;
    successLooksLike: string | null;
    whoFor: string | null;
    qualifyOutcome: QualifyOutcome;
    budgetNote: string | null;
    deadlineNote: string | null;
    callAt: string | null;
    qualifyNotes: string | null;
    status: ProjectStatus;
  };
  locked?: boolean;
  defaultEditing?: boolean;
}) {
  const showQualify = !isProduct;
  const outcome = project.qualifyOutcome;
  const notes = project.qualifyNotes?.trim() ?? "";
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
        isProduct
          ? undefined
          : "Qualify outcome, problem, what we're building, who, timeline, budget, and status — one place."
      }
      editLabel={isProduct ? "Edit" : "Edit brief"}
      showEdit={!locked}
      defaultEditing={defaultEditing && !locked}
      view={
        <div className="space-y-6">
          {showQualify ? (
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={cn(
                  "inline-flex rounded-full border px-3 py-1 text-sm font-medium",
                  outcomeTone(outcome),
                )}
              >
                {qualifyOutcomeLabel(outcome)}
              </span>
              {outcome !== "real" && outcome !== "no" ? (
                <p className="text-sm text-gray-600">
                  Leave Qualify only when this is a real project.
                </p>
              ) : null}
              {outcome === "real" ? (
                <p className="text-sm text-gray-600">Ready for discovery.</p>
              ) : null}
              {outcome === "no" ? (
                <p className="text-sm text-red-800">
                  Not a project — pipeline closes (status Lost).
                </p>
              ) : null}
            </div>
          ) : null}

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Title
            </p>
            <p className="mt-1 text-sm text-dark-950">{project.title}</p>
          </div>

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

          {showQualify ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Who it is for
              </p>
              <MarkedValue value={project.whoFor} size="meta" />
            </div>
          ) : null}

          <dl
            className={
              showQualify
                ? "grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-4"
                : "grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2"
            }
          >
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {showQualify ? "Needed by" : "Deadline"}
              </dt>
              <MarkedValue
                value={project.deadlineNote}
                size="meta"
                className="mt-1"
              />
            </div>
            {showQualify || project.budgetNote ? (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Budget
                </dt>
                <MarkedValue
                  value={project.budgetNote}
                  size="meta"
                  className="mt-1"
                />
              </div>
            ) : null}
            {showQualify ? (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Call / window
                </dt>
                <MarkedValue
                  value={project.callAt}
                  size="meta"
                  className="mt-1"
                />
              </div>
            ) : null}
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Status
              </dt>
              <dd className="mt-1 text-sm text-gray-800">
                {projectStatusLabel(project.status)}
              </dd>
            </div>
          </dl>

          {showQualify && notes ? (
            <div className="rounded-xl bg-gray-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Notes
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                {notes}
              </p>
            </div>
          ) : null}
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
              whoFor: project.whoFor ?? "",
              qualifyOutcome: project.qualifyOutcome,
              budgetNote: project.budgetNote ?? "",
              deadlineNote: project.deadlineNote ?? "",
              callAt: project.callAt ?? "",
              qualifyNotes: project.qualifyNotes ?? "",
              status: project.status,
            }}
            problemHint={
              isProduct ? undefined : "Needed before you leave Discover."
            }
            showQualify={showQualify}
            hideWantBuilt={isProduct}
          />
        )
      }
    />
  );
}
