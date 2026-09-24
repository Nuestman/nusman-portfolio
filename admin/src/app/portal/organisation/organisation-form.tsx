"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import {
  savePortalOrganisationAction,
  type PortalOrganisationFormState,
} from "./actions";

const initialState: PortalOrganisationFormState = { error: null };

export function PortalOrganisationForm({
  client,
  onCancel,
}: {
  client: {
    name: string;
    organisation: string;
    email: string;
    phone: string;
  };
  onCancel: () => void;
}) {
  const [state, action, pending] = useActionState(
    savePortalOrganisationAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="org-name" className={labelClassName}>
          Hiring party
        </label>
        <input
          id="org-name"
          name="name"
          required
          maxLength={200}
          defaultValue={client.name}
          className={fieldClassName}
          placeholder="Who is hiring"
        />
      </div>
      <div>
        <label htmlFor="org-organisation" className={labelClassName}>
          Organisation
        </label>
        <input
          id="org-organisation"
          name="organisation"
          maxLength={200}
          defaultValue={client.organisation}
          className={fieldClassName}
          autoComplete="organization"
          placeholder="Company or group name"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="org-email" className={labelClassName}>
            Email
          </label>
          <input
            id="org-email"
            name="email"
            type="email"
            maxLength={320}
            defaultValue={client.email}
            className={fieldClassName}
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="org-phone" className={labelClassName}>
            Phone
          </label>
          <input
            id="org-phone"
            name="phone"
            type="tel"
            maxLength={40}
            defaultValue={client.phone}
            className={fieldClassName}
            autoComplete="tel"
          />
        </div>
      </div>
      <FormError>{state.error}</FormError>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save organisation"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
