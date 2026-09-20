"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
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
    return null;
  }

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="projectId" value={projectId} />
      {answers.map((item) => (
        <div key={item.theme}>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-gold-700">
            {item.theme}
          </p>
          <label
            htmlFor={`portal-intake-${item.theme}`}
            className={`${labelClassName} mt-2`}
          >
            {item.ask}
          </label>
          <textarea
            id={`portal-intake-${item.theme}`}
            name={`answer_${item.theme}`}
            rows={4}
            defaultValue={item.answer}
            className={fieldClassName}
          />
        </div>
      ))}
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save answers"}
      </Button>
    </form>
  );
}
