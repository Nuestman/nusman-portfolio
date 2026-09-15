"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { saveDiscoveryAction, type FormState } from "./actions";

const initialState: FormState = { error: null };

export function DiscoveryForm({
  projectId,
  discovery,
}: {
  projectId: string;
  discovery: {
    callAt: string;
    attendees: string;
    currentProcess: string;
    lastExample: string;
    inScope: string;
    outOfScope: string;
    devicesLanguage: string;
    privacyNotes: string;
  };
}) {
  const [state, action, pending] = useActionState(
    saveDiscoveryAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="discovery-callAt" className={labelClassName}>
            Call
          </label>
          <input
            id="discovery-callAt"
            name="callAt"
            defaultValue={discovery.callAt}
            className={fieldClassName}
            placeholder="Date or window"
          />
        </div>
        <div>
          <label htmlFor="discovery-attendees" className={labelClassName}>
            Attendees
          </label>
          <input
            id="discovery-attendees"
            name="attendees"
            defaultValue={discovery.attendees}
            className={fieldClassName}
            placeholder="Buyer, daily user…"
          />
        </div>
      </div>
      <div>
        <label htmlFor="discovery-currentProcess" className={labelClassName}>
          Current process
        </label>
        <textarea
          id="discovery-currentProcess"
          name="currentProcess"
          rows={3}
          defaultValue={discovery.currentProcess}
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="discovery-lastExample" className={labelClassName}>
          Last real example
        </label>
        <textarea
          id="discovery-lastExample"
          name="lastExample"
          rows={3}
          defaultValue={discovery.lastExample}
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="discovery-inScope" className={labelClassName}>
          In scope
        </label>
        <textarea
          id="discovery-inScope"
          name="inScope"
          rows={3}
          defaultValue={discovery.inScope}
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="discovery-outOfScope" className={labelClassName}>
          Out of scope
        </label>
        <textarea
          id="discovery-outOfScope"
          name="outOfScope"
          rows={3}
          defaultValue={discovery.outOfScope}
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="discovery-devicesLanguage" className={labelClassName}>
          Devices, language, literacy
        </label>
        <textarea
          id="discovery-devicesLanguage"
          name="devicesLanguage"
          rows={2}
          defaultValue={discovery.devicesLanguage}
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="discovery-privacyNotes" className={labelClassName}>
          Privacy
        </label>
        <textarea
          id="discovery-privacyNotes"
          name="privacyNotes"
          rows={2}
          defaultValue={discovery.privacyNotes}
          className={fieldClassName}
        />
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save discovery"}
      </Button>
    </form>
  );
}
