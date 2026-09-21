import { EditableCard } from "@/components/editable-card";
import { MarkedValue } from "@/components/set-mark";
import { cn } from "@/lib/utils";
import { qualifyOutcomeLabel, WANT_BUILT_LABEL } from "@/lib/labels";
import type { QualifyOutcome } from "@/db/schema";
import { QualifyForm } from "./qualify-form";

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

export function QualifyCard({
  projectId,
  qualify,
  wantBuilt,
}: {
  projectId: string;
  qualify: {
    outcome: QualifyOutcome;
    whoFor: string | null;
    painToday: string | null;
    neededBy: string | null;
    budgetNote: string | null;
    callAt: string | null;
    notes: string | null;
  } | null;
  wantBuilt: string | null;
}) {
  const outcome = qualify?.outcome ?? "undecided";
  const pain = qualify?.painToday?.trim() ?? "";
  const who = qualify?.whoFor?.trim() ?? "";
  const notes = qualify?.notes?.trim() ?? "";

  return (
    <EditableCard
      title="Qualify"
      hint="Same brief as /start — oral or inbound. Mark Real before you leave this stage."
      view={
        <div className="space-y-6">
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

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Pain today
            </p>
            <MarkedValue value={pain} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              {WANT_BUILT_LABEL}
            </p>
            <MarkedValue value={wantBuilt} />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
              Who it is for
            </p>
            <MarkedValue value={who} size="meta" />
          </div>

          <dl className="grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Needed by
              </dt>
              <MarkedValue
                value={qualify?.neededBy}
                size="meta"
                className="mt-1"
              />
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Budget
              </dt>
              <MarkedValue
                value={qualify?.budgetNote}
                size="meta"
                className="mt-1"
              />
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Call / window
              </dt>
              <MarkedValue
                value={qualify?.callAt}
                size="meta"
                className="mt-1"
              />
            </div>
          </dl>

          {notes ? (
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
        <QualifyForm
          projectId={projectId}
          qualify={{
            outcome,
            whoFor: qualify?.whoFor ?? "",
            painToday: qualify?.painToday ?? "",
            wantBuilt: wantBuilt ?? "",
            neededBy: qualify?.neededBy ?? "",
            budgetNote: qualify?.budgetNote ?? "",
            callAt: qualify?.callAt ?? "",
            notes: qualify?.notes ?? "",
          }}
        />
      }
    />
  );
}
