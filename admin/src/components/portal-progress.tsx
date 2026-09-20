import type { ProjectStatus } from "@/db/schema";
import { GATE_GUIDES } from "@/lib/gates";
import { projectStatusLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";

type Milestone = {
  id: string;
  label: string;
  stage: string;
  sortOrder: number;
  doneAt: Date | string | null;
};

type CheckpointState = "done" | "current" | "upcoming";

function checkpointState(done: boolean, isCurrent: boolean): CheckpointState {
  if (done) {
    return "done";
  }
  if (isCurrent) {
    return "current";
  }
  return "upcoming";
}

function statusPillClass(status: ProjectStatus): string {
  switch (status) {
    case "active":
      return "bg-gold-100 text-gold-800";
    case "paused":
      return "bg-gray-100 text-gray-700";
    case "won":
    case "done":
      return "bg-gold-500 text-white";
    case "lost":
      return "bg-red-50 text-red-800";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

function CheckpointMark({ state }: { state: CheckpointState }) {
  switch (state) {
    case "done":
      return (
        <span
          className="flex h-[15px] w-[15px] items-center justify-center rounded-full bg-gold-500 ring-4 ring-gold-100"
          aria-hidden
        />
      );
    case "current":
      return (
        <span
          className="flex h-[15px] w-[15px] items-center justify-center rounded-full border-2 border-gold-500 bg-white"
          aria-hidden
        >
          <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
        </span>
      );
    case "upcoming":
      return (
        <span
          className="h-[15px] w-[15px] rounded-full border-2 border-gray-200 bg-white"
          aria-hidden
        />
      );
    default: {
      const exhaustive: never = state;
      return exhaustive;
    }
  }
}

function groupMilestones(milestones: Milestone[]) {
  const ordered = [...milestones].sort((a, b) => a.sortOrder - b.sortOrder);
  const used = new Set<string>();
  const groups: { key: string; label: string; items: Milestone[] }[] =
    GATE_GUIDES.map((guide) => {
      const items = ordered.filter((item) => item.stage === guide.id);
      for (const item of items) {
        used.add(item.id);
      }
      return { key: guide.id, label: guide.publicStep, items };
    }).filter((group) => group.items.length > 0);

  const leftover = ordered.filter((item) => !used.has(item.id));
  if (leftover.length > 0) {
    groups.push({ key: "other", label: "Next", items: leftover });
  }
  return groups;
}

export function PortalProgress({
  publicStep,
  status,
  problem,
  success,
  milestones,
}: {
  publicStep: string;
  status: ProjectStatus;
  problem: string | null;
  success: string | null;
  milestones: Milestone[];
}) {
  const groups = groupMilestones(milestones);
  const ordered = groups.flatMap((group) => group.items);
  const doneCount = ordered.filter((item) => item.doneAt).length;
  const currentId =
    ordered.find((item) => !item.doneAt)?.id ??
    ordered[ordered.length - 1]?.id ??
    null;
  const total = ordered.length;
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const brief = Boolean(problem?.trim() || success?.trim());

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h3 className="font-heading text-3xl text-dark-950">{publicStep}</h3>
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium",
              statusPillClass(status),
            )}
          >
            {projectStatusLabel(status)}
          </span>
        </div>
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-gold-100"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={`${doneCount} of ${total} checkpoints done`}
        >
          <div
            className="h-full rounded-full bg-gold-500 transition-[width] duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {doneCount} of {total} checkpoints
        </p>
      </div>

      {brief ? (
        <div className="grid gap-5 rounded-2xl border border-gold-100 bg-gold-50/60 p-5 sm:grid-cols-2">
          {problem?.trim() ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-700">
                Problem
              </p>
              <p className="mt-2 text-base leading-relaxed text-dark-950">
                {problem}
              </p>
            </div>
          ) : null}
          {success?.trim() ? (
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-700">
                Success looks like
              </p>
              <p className="mt-2 text-base leading-relaxed text-dark-950">
                {success}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {total > 0 ? (
        <ol className="relative space-y-6 pl-9">
          <span
            className="absolute bottom-3 left-[7px] top-2 w-px bg-gradient-to-b from-gold-500 via-gold-300 to-gray-200"
            aria-hidden
          />
          {groups.map((group) => (
            <li key={group.key}>
              <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.16em] text-gold-700">
                {group.label}
              </p>
              <ol className="space-y-4">
                {group.items.map((item) => {
                  const done = Boolean(item.doneAt);
                  const state = checkpointState(done, item.id === currentId);
                  return (
                    <li
                      key={item.id}
                      className="relative"
                      aria-current={state === "current" ? "step" : undefined}
                    >
                      <span className="absolute -left-9 top-1">
                        <CheckpointMark state={state} />
                      </span>
                      <p
                        className={cn(
                          "text-sm leading-snug",
                          state === "done"
                            ? "text-gray-600"
                            : state === "current"
                              ? "font-medium text-dark-950"
                              : "text-gray-500",
                        )}
                      >
                        {item.label}
                      </p>
                      {state === "current" ? (
                        <p className="mt-0.5 text-xs text-gold-700">
                          Now
                        </p>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
