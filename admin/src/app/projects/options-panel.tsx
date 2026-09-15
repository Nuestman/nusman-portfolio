import Link from "next/link";
import { ConfirmClick, ConfirmDelete } from "@/components/confirm-submit";
import { EditableCard } from "@/components/editable-card";
import {
  EditLink,
  TableActionsCell,
  TableActionsHeader,
} from "@/components/table-actions";
import { buttonClassName } from "@/components/ui/button";
import { gateIndex } from "@/lib/gates";
import { optionKindLabel } from "@/lib/labels";
import { linkClassName } from "@/lib/links";
import { snippet } from "@/lib/text";
import { tableClassName, tableFrameClassName } from "@/lib/tables";
import { optionStarter, unusedOptionKinds } from "@/lib/templates";
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
  const onlyKind = remainingKinds.length === 1 ? remainingKinds[0] : undefined;
  const hasChosen = options.some((option) => option.selected);
  const needsChoice =
    gateIndex(currentGate) >= gateIndex("propose") && !hasChosen;

  return (
    <EditableCard
      title="Options"
      hint="Offer light, recommended, and later. Choose one before you leave Propose."
      editLabel="Add"
      showEdit={remainingKinds.length > 0}
      always={
        <>
          {needsChoice ? (
            <p className="rounded-lg bg-amber-100 px-4 py-3 text-sm text-amber-950">
              No package is chosen yet. You cannot leave Propose until you pick
              one.
            </p>
          ) : null}
          {options.length === 0 ? (
            <p className="text-sm text-gray-600">No packages yet.</p>
          ) : (
            <div className={tableFrameClassName}>
              <table className={tableClassName}>
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Package</th>
                    <th className="px-4 py-3 font-medium">Summary</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">
                      Price
                    </th>
                    <TableActionsHeader />
                  </tr>
                </thead>
                <tbody>
                  {options.map((option) => (
                    <tr
                      key={option.id}
                      className="border-t border-gray-100"
                      data-current={option.selected || undefined}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/projects/${projectId}/options/${option.id}/edit`}
                          className={linkClassName("table")}
                        >
                          {optionKindLabel(option.kind)}
                          {option.selected ? " · Chosen" : ""}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {snippet(option.summary)}
                      </td>
                      <td className="hidden px-4 py-3 text-gray-700 sm:table-cell">
                        {option.priceNote ?? "—"}
                      </td>
                      <TableActionsCell>
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
                      </TableActionsCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {remainingKinds.length === 0 ? (
            <p className="text-sm text-gray-600">
              All three packages are on this project.
            </p>
          ) : null}
        </>
      }
      form={
        remainingKinds.length === 0 ? null : (
          <OptionForm
            submitLabel="Add option"
            availableKinds={remainingKinds}
            option={{
              projectId,
              kind: onlyKind ?? "",
              summary: onlyKind ? optionStarter(onlyKind) : "",
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
