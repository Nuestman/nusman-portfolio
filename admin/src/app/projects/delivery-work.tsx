import { ConfirmDelete } from "@/components/confirm-submit";
import { EditableCard } from "@/components/editable-card";
import { InfoList } from "@/components/info-list";
import {
  EditLink,
  TableActionsCell,
  TableActionsHeader,
} from "@/components/table-actions";
import { changeStatusLabel } from "@/lib/labels";
import { displayYesNo, snippet } from "@/lib/text";
import { tableClassName, tableFrameClassName } from "@/lib/tables";
import type { ChangeStatus } from "@/db/schema";
import {
  deleteChangeRequestAction,
  deleteDemoAction,
} from "./actions";
import { ChangeForm } from "./change-form";
import { DemoForm } from "./demo-form";
import { LaunchForm } from "./launch-form";

type ChangeRow = {
  id: string;
  body: string;
  status: ChangeStatus;
};

type DemoRow = {
  id: string;
  happenedAt: string | null;
  notes: string;
};

export function DeliveryWork({
  projectId,
  isProduct = false,
  changes,
  demos,
  launch,
}: {
  projectId: string;
  isProduct?: boolean;
  changes: ChangeRow[];
  demos: DemoRow[];
  launch: {
    trained: boolean;
    guideLeft: boolean;
    remainingInvoiced: boolean;
    maintenanceOffered: boolean;
    handoverNote: string | null;
  } | null;
}) {
  return (
    <>
      <EditableCard
        title="Build — change requests"
        hint="New ideas go on a list and are priced separately. They do not enter the sprint."
        editLabel="Add"
        always={
          changes.length === 0 ? (
            <p className="text-sm text-gray-600">No change requests yet.</p>
          ) : (
            <div className={tableFrameClassName}>
              <table className={tableClassName}>
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Request</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <TableActionsHeader />
                  </tr>
                </thead>
                <tbody>
                  {changes.map((change) => (
                    <tr key={change.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">
                        {snippet(change.body)}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {changeStatusLabel(change.status)}
                      </td>
                      <TableActionsCell>
                        <EditLink
                          href={`/projects/${projectId}/changes/${change.id}/edit`}
                        />
                        <form action={deleteChangeRequestAction}>
                          <input type="hidden" name="id" value={change.id} />
                          <input
                            type="hidden"
                            name="projectId"
                            value={projectId}
                          />
                          <ConfirmDelete
                            label="Remove"
                            message="Remove this change request?"
                          />
                        </form>
                      </TableActionsCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        form={<ChangeForm projectId={projectId} submitLabel="Add change" />}
      />

      <EditableCard
        title="Build — demos"
        hint={
          isProduct
            ? "Weekly working software you can tap."
            : "Weekly working software the daily user can tap."
        }
        editLabel="Add"
        always={
          demos.length === 0 ? (
            <p className="text-sm text-gray-600">No demos yet.</p>
          ) : (
            <div className={tableFrameClassName}>
              <table className={tableClassName}>
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Notes</th>
                    <TableActionsHeader />
                  </tr>
                </thead>
                <tbody>
                  {demos.map((demo) => (
                    <tr key={demo.id} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">
                        {demo.happenedAt ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {snippet(demo.notes)}
                      </td>
                      <TableActionsCell>
                        <EditLink
                          href={`/projects/${projectId}/demos/${demo.id}/edit`}
                        />
                        <form action={deleteDemoAction}>
                          <input type="hidden" name="id" value={demo.id} />
                          <input
                            type="hidden"
                            name="projectId"
                            value={projectId}
                          />
                          <ConfirmDelete
                            label="Remove"
                            message="Remove this demo?"
                          />
                        </form>
                      </TableActionsCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
        form={
          <DemoForm
            projectId={projectId}
            isProduct={isProduct}
            submitLabel="Add demo"
          />
        }
      />

      <EditableCard
        title="Launch"
        hint="Train, leave a guide, invoice the rest, offer paid care."
        view={
          <InfoList
            items={[
              {
                label: isProduct ? "Trained" : "Daily user trained",
                value: displayYesNo(launch?.trained ?? false),
              },
              {
                label: "Simple guide left",
                value: displayYesNo(launch?.guideLeft ?? false),
              },
              {
                label: "Remaining balance invoiced",
                value: displayYesNo(launch?.remainingInvoiced ?? false),
              },
              {
                label: "Optional paid maintenance offered",
                value: displayYesNo(launch?.maintenanceOffered ?? false),
              },
              { label: "Handover note", value: launch?.handoverNote },
            ]}
          />
        }
        form={
          <LaunchForm
            projectId={projectId}
            isProduct={isProduct}
            launch={{
              trained: launch?.trained ?? false,
              guideLeft: launch?.guideLeft ?? false,
              remainingInvoiced: launch?.remainingInvoiced ?? false,
              maintenanceOffered: launch?.maintenanceOffered ?? false,
              handoverNote: launch?.handoverNote ?? "",
            }}
          />
        }
      />
    </>
  );
}
