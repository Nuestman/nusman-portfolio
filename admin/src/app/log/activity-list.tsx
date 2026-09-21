import { ConfirmDelete } from "@/components/confirm-submit";
import {
  EditLink,
  TableActionsCell,
  TableActionsHeader,
} from "@/components/table-actions";
import { formatStamp, snippet } from "@/lib/text";
import { tableClassName, TableFrame } from "@/lib/tables";
import { deleteActivityAction } from "./actions";

type ActivityRow = {
  id: string;
  body: string;
  createdAt: Date;
};

export function ActivityList({
  entries,
  next,
}: {
  entries: ActivityRow[];
  next: "/" | "/log";
}) {
  if (entries.length === 0) {
    return <p className="text-sm text-gray-600">Nothing in the journal yet.</p>;
  }

  return (
    <TableFrame>
      <table className={tableClassName}>
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="px-4 py-3 font-medium">When</th>
            <th className="px-4 py-3 font-medium">Line</th>
            <TableActionsHeader />
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-t border-gray-100">
              <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                {formatStamp(entry.createdAt)}
              </td>
              <td className="px-4 py-3 text-gray-700">{snippet(entry.body)}</td>
              <TableActionsCell>
                <EditLink href={`/log/${entry.id}/edit`} />
                <form action={deleteActivityAction}>
                  <input type="hidden" name="id" value={entry.id} />
                  <input type="hidden" name="next" value={next} />
                  <ConfirmDelete
                    label="Remove"
                    message="Remove this line?"
                  />
                </form>
              </TableActionsCell>
            </tr>
          ))}
        </tbody>
      </table>
    </TableFrame>
  );
}
