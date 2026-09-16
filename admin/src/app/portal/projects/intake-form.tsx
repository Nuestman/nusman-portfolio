"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName } from "@/lib/forms";
import { tableClassName, tableFrameClassName } from "@/lib/tables";
import {
  savePortalIntakeAction,
  type PortalFormState,
} from "@/app/portal/projects/actions";

const initialState: PortalFormState = { error: null };

type IntakeRow = {
  theme: string;
  ask: string;
  answer: string;
};

export function PortalIntakeForm({
  projectId,
  answers,
  open,
}: {
  projectId: string;
  answers: IntakeRow[];
  open: boolean;
}) {
  const [state, action, pending] = useActionState(
    savePortalIntakeAction,
    initialState,
  );

  if (!open) {
    return (
      <p className="text-sm text-gray-600">
        Discovery is closed for edits. You can still read the answers below.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      <div className={tableFrameClassName}>
        <table className={tableClassName}>
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Theme</th>
              <th className="px-4 py-3 font-medium">Question</th>
              <th className="px-4 py-3 font-medium">Answer</th>
            </tr>
          </thead>
          <tbody>
            {answers.map((item) => (
              <tr key={item.theme} className="border-t border-gray-100">
                <td className="px-4 py-3 align-top font-medium text-dark-950">
                  {item.theme}
                </td>
                <td className="px-4 py-3 align-top text-gray-700">{item.ask}</td>
                <td className="px-4 py-3">
                  <label className="sr-only" htmlFor={`portal-intake-${item.theme}`}>
                    {item.theme} answer
                  </label>
                  <textarea
                    id={`portal-intake-${item.theme}`}
                    name={`answer_${item.theme}`}
                    rows={3}
                    defaultValue={item.answer}
                    className={fieldClassName}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save answers"}
      </Button>
    </form>
  );
}
