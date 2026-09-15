"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { AGREEMENT_CLAUSES } from "@/lib/templates";
import {
  checkboxClassName,
  fieldClassName,
  labelClassName,
} from "@/lib/forms";
import { saveAgreementAction, type FormState } from "./actions";

const initialState: FormState = { error: null };

type ClauseField =
  | "parties"
  | "outcome"
  | "scope"
  | "money"
  | "time"
  | "changes"
  | "support"
  | "workplace";
type AgreementClause = (typeof AGREEMENT_CLAUSES)[number]["clause"];

function clauseField(clause: AgreementClause): ClauseField {
  switch (clause) {
    case "Parties":
      return "parties";
    case "Outcome":
      return "outcome";
    case "Scope":
      return "scope";
    case "Money":
      return "money";
    case "Time":
      return "time";
    case "Changes":
      return "changes";
    case "Support":
      return "support";
    case "Workplace":
      return "workplace";
    default: {
      const _exhaustive: never = clause;
      return _exhaustive;
    }
  }
}

export function AgreementForm({
  projectId,
  agreement,
}: {
  projectId: string;
  agreement: Record<ClauseField, string> & {
    depositPaid: boolean;
    confirmed: boolean;
  };
}) {
  const [state, action, pending] = useActionState(
    saveAgreementAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      {AGREEMENT_CLAUSES.map((item) => {
        const name = clauseField(item.clause);
        return (
          <div key={item.clause}>
            <label htmlFor={`agree-${name}`} className={labelClassName}>
              {item.clause}
            </label>
            <p className="mb-2 text-sm text-gray-600">{item.detail}</p>
            <textarea
              id={`agree-${name}`}
              name={name}
              rows={3}
              defaultValue={agreement[name]}
              className={fieldClassName}
            />
          </div>
        );
      })}
      <label className="flex items-center gap-2 text-sm text-dark-950">
        <input
          type="checkbox"
          name="depositPaid"
          defaultChecked={agreement.depositPaid}
          className={checkboxClassName}
        />
        Deposit paid
      </label>
      <label className="flex items-center gap-2 text-sm text-dark-950">
        <input
          type="checkbox"
          name="confirmed"
          defaultChecked={agreement.confirmed}
          className={checkboxClassName}
        />
        Signed or WhatsApp confirmed
      </label>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save agreement"}
      </Button>
    </form>
  );
}
