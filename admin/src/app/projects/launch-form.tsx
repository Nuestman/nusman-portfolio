"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import {
  checkboxClassName,
  fieldClassName,
  labelClassName,
} from "@/lib/forms";
import { saveLaunchAction, type FormState } from "./actions";

const initialState: FormState = { error: null };

export function LaunchForm({
  projectId,
  isProduct = false,
  launch,
}: {
  projectId: string;
  isProduct?: boolean;
  launch: {
    trained: boolean;
    guideLeft: boolean;
    remainingInvoiced: boolean;
    maintenanceOffered: boolean;
    handoverNote: string;
  };
}) {
  const [state, action, pending] = useActionState(
    saveLaunchAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      <label className="flex items-center gap-2 text-sm text-dark-950">
        <input
          type="checkbox"
          name="trained"
          defaultChecked={launch.trained}
          className={checkboxClassName}
        />
        {isProduct ? "Trained" : "Daily user trained"}
      </label>
      <label className="flex items-center gap-2 text-sm text-dark-950">
        <input
          type="checkbox"
          name="guideLeft"
          defaultChecked={launch.guideLeft}
          className={checkboxClassName}
        />
        Simple guide left
      </label>
      <label className="flex items-center gap-2 text-sm text-dark-950">
        <input
          type="checkbox"
          name="remainingInvoiced"
          defaultChecked={launch.remainingInvoiced}
          className={checkboxClassName}
        />
        Remaining balance invoiced
      </label>
      <label className="flex items-center gap-2 text-sm text-dark-950">
        <input
          type="checkbox"
          name="maintenanceOffered"
          defaultChecked={launch.maintenanceOffered}
          className={checkboxClassName}
        />
        Optional paid maintenance offered
      </label>
      <div>
        <label htmlFor="launch-handoverNote" className={labelClassName}>
          Handover note
        </label>
        <textarea
          id="launch-handoverNote"
          name="handoverNote"
          rows={4}
          defaultValue={launch.handoverNote}
          className={fieldClassName}
        />
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save launch"}
      </Button>
    </form>
  );
}
