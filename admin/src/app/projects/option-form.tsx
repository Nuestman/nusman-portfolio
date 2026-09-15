"use client";

import { useActionState, useState } from "react";
import type { OptionKind } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {
  createOptionAction,
  updateOptionAction,
  type FormState,
} from "@/app/projects/actions";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { isOptionKind, optionKindLabel } from "@/lib/labels";
import { optionStarter } from "@/lib/templates";

const initialState: FormState = { error: null };

type OptionValues = {
  id?: string;
  projectId: string;
  kind: OptionKind | "";
  summary: string;
  priceNote: string;
  timelineNote: string;
  inScope: string;
  outOfScope: string;
};

export function OptionForm({
  option,
  availableKinds,
  submitLabel,
}: {
  option: OptionValues;
  availableKinds: readonly OptionKind[];
  submitLabel: string;
}) {
  const action = option.id ? updateOptionAction : createOptionAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [kind, setKind] = useState<OptionKind | "">(option.kind);

  const coaching =
    kind && isOptionKind(kind) ? optionStarter(kind) : null;

  return (
    <form action={formAction} className="space-y-5">
      {option.id ? <input type="hidden" name="id" value={option.id} /> : null}
      <input type="hidden" name="projectId" value={option.projectId} />
      <div>
        <label htmlFor="option-kind" className={labelClassName}>
          Package
        </label>
        {option.id ? (
          <>
            <input type="hidden" name="kind" value={option.kind} />
            <p className="text-sm text-gray-700">
              {option.kind ? optionKindLabel(option.kind) : ""}
            </p>
          </>
        ) : (
          <select
            id="option-kind"
            name="kind"
            required
            value={kind}
            onChange={(event) => {
              const next = event.target.value;
              setKind(isOptionKind(next) ? next : "");
            }}
            className={fieldClassName}
          >
            <option value="">Choose package</option>
            {availableKinds.map((item) => (
              <option key={item} value={item}>
                {optionKindLabel(item)}
              </option>
            ))}
          </select>
        )}
      </div>
      {coaching ? (
        <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
          <span className="font-medium text-dark-950">Desk coaching only — </span>
          {coaching}
        </p>
      ) : null}
      <div>
        <label htmlFor="option-summary" className={labelClassName}>
          Client summary
        </label>
        <textarea
          id="option-summary"
          name="summary"
          required
          rows={4}
          defaultValue={option.summary}
          placeholder="What the client should understand about this package…"
          className={fieldClassName}
        />
        <p className="mt-1.5 text-xs text-gray-500">
          Shown on the portal. Write for the client — not the Desk coaching hint.
        </p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="option-price" className={labelClassName}>
            Price
          </label>
          <input
            id="option-price"
            name="priceNote"
            defaultValue={option.priceNote ?? ""}
            placeholder="e.g. GHS 4,500"
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="option-timeline" className={labelClassName}>
            Timeline
          </label>
          <input
            id="option-timeline"
            name="timelineNote"
            defaultValue={option.timelineNote ?? ""}
            placeholder="e.g. 3 weeks"
            className={fieldClassName}
          />
        </div>
      </div>
      <div>
        <label htmlFor="option-in-scope" className={labelClassName}>
          In scope
        </label>
        <textarea
          id="option-in-scope"
          name="inScope"
          rows={3}
          defaultValue={option.inScope ?? ""}
          placeholder="What this package includes…"
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="option-out-of-scope" className={labelClassName}>
          Out of scope
        </label>
        <textarea
          id="option-out-of-scope"
          name="outOfScope"
          rows={3}
          defaultValue={option.outOfScope ?? ""}
          placeholder="What is parked for later…"
          className={fieldClassName}
        />
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
