import Link from "next/link";
import { ConfirmClick, ConfirmDelete } from "@/components/confirm-submit";
import { EditableCard } from "@/components/editable-card";
import { EditLink } from "@/components/table-actions";
import { buttonClassName } from "@/components/ui/button";
import { gateIndex } from "@/lib/gates";
import { optionKindLabel } from "@/lib/labels";
import { displayText } from "@/lib/text";
import { isOptionStarterSummary, unusedOptionKinds } from "@/lib/templates";
import { cn } from "@/lib/utils";
import type { OptionKind, ProjectGate } from "@/db/schema";
import { deleteOptionAction, selectOptionAction } from "./actions";
import { OptionForm } from "./option-form";

type OptionRow = {
  id: string;
  kind: OptionKind;
  summary: string;
  priceNote: string | null;
  timelineNote: string | null;
  inScope: string | null;
  outOfScope: string | null;
  selected: boolean;
};

function optionGaps(option: OptionRow): string[] {
  const gaps: string[] = [];
  if (isOptionStarterSummary(option.summary, option.kind)) {
    gaps.push("client summary still uses Desk coaching copy");
  }
  if (!option.priceNote?.trim()) {
    gaps.push("price");
  }
  if (!option.timelineNote?.trim()) {
    gaps.push("timeline");
  }
  if (!option.inScope?.trim()) {
    gaps.push("in scope");
  }
  return gaps;
}

export function OptionsPanel({
  projectId,
  options,
  currentGate,
}: {
  projectId: string;
  options: OptionRow[];
  currentGate: ProjectGate;
}) {
  const remainingKinds = unusedOptionKinds(options.map((item) => item.kind));
  const hasChosen = options.some((option) => option.selected);
  const needsChoice =
    gateIndex(currentGate) >= gateIndex("propose") && !hasChosen;
  const chosen = options.find((option) => option.selected) ?? null;

  return (
    <EditableCard
      title="Options"
      hint="Offer light, recommended, and later. Write each summary for the client — they see the chosen one on the portal."
      editLabel="Add"
      showEdit={remainingKinds.length > 0}
      always={
        <div className="space-y-4">
          {needsChoice ? (
            <p className="rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-950">
              No package is chosen yet. You cannot leave Propose until you pick
              one.
            </p>
          ) : null}

          {chosen ? (
            <div className="rounded-xl border border-dark-950/10 bg-gray-50 px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Chosen for this job
              </p>
              <p className="mt-1 font-heading text-2xl text-dark-950">
                {optionKindLabel(chosen.kind)}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                {isOptionStarterSummary(chosen.summary, chosen.kind)
                  ? "Client summary still needs rewriting before the portal looks right."
                  : chosen.summary}
              </p>
              <dl className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                <div>
                  <dt className="font-medium text-dark-950">Price</dt>
                  <dd>{displayText(chosen.priceNote)}</dd>
                </div>
                <div>
                  <dt className="font-medium text-dark-950">Timeline</dt>
                  <dd>{displayText(chosen.timelineNote)}</dd>
                </div>
              </dl>
            </div>
          ) : null}

          {options.length === 0 ? (
            <p className="text-sm text-gray-600">
              No packages yet. Add light, recommended, and later.
            </p>
          ) : (
            <ul className="space-y-4">
              {options.map((option) => {
                const gaps = optionGaps(option);
                return (
                  <li
                    key={option.id}
                    className={cn(
                      "rounded-xl border px-4 py-4",
                      option.selected
                        ? "border-dark-950 bg-white"
                        : "border-gray-200 bg-white",
                    )}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-heading text-2xl text-dark-950">
                          {optionKindLabel(option.kind)}
                          {option.selected ? (
                            <span className="ml-2 text-sm font-sans font-medium text-gold-600">
                              Chosen
                            </span>
                          ) : null}
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                          {option.summary}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {option.selected ? null : (
                          <form action={selectOptionAction}>
                            <input type="hidden" name="id" value={option.id} />
                            <input
                              type="hidden"
                              name="projectId"
                              value={projectId}
                            />
                            <ConfirmClick
                              message={`Choose the ${optionKindLabel(option.kind).toLowerCase()} package? This is the one the job runs on.`}
                              className={buttonClassName("outline", "sm")}
                            >
                              Choose
                            </ConfirmClick>
                          </form>
                        )}
                        <EditLink
                          href={`/projects/${projectId}/options/${option.id}/edit`}
                        />
                        {option.selected ? null : (
                          <form action={deleteOptionAction}>
                            <input type="hidden" name="id" value={option.id} />
                            <input
                              type="hidden"
                              name="projectId"
                              value={projectId}
                            />
                            <ConfirmDelete
                              label="Remove"
                              message={`Remove the ${optionKindLabel(option.kind).toLowerCase()} option?`}
                            />
                          </form>
                        )}
                      </div>
                    </div>

                    <dl className="mt-4 grid gap-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="font-medium text-dark-950">Price</dt>
                        <dd className="mt-1 text-gray-700">
                          {displayText(option.priceNote)}
                        </dd>
                      </div>
                      <div>
                        <dt className="font-medium text-dark-950">Timeline</dt>
                        <dd className="mt-1 text-gray-700">
                          {displayText(option.timelineNote)}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="font-medium text-dark-950">In scope</dt>
                        <dd className="mt-1 whitespace-pre-wrap text-gray-700">
                          {displayText(option.inScope)}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="font-medium text-dark-950">Out of scope</dt>
                        <dd className="mt-1 whitespace-pre-wrap text-gray-700">
                          {displayText(option.outOfScope)}
                        </dd>
                      </div>
                    </dl>

                    {gaps.length > 0 ? (
                      <p className="mt-3 text-sm text-amber-800">
                        Still thin: {gaps.join(", ")}.{" "}
                        <Link
                          href={`/projects/${projectId}/options/${option.id}/edit`}
                          className="underline decoration-amber-800/40 underline-offset-2"
                        >
                          Edit
                        </Link>
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}

          {remainingKinds.length === 0 ? (
            <p className="text-sm text-gray-600">
              All three packages are on this project.
            </p>
          ) : null}
        </div>
      }
      form={
        remainingKinds.length === 0 ? null : (
          <OptionForm
            submitLabel="Add option"
            availableKinds={remainingKinds}
            option={{
              projectId,
              kind: "",
              summary: "",
              priceNote: "",
              timelineNote: "",
              inScope: "",
              outOfScope: "",
            }}
          />
        )
      }
    />
  );
}
