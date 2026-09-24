"use client";

import { useActionState } from "react";
import { PERSON_ROLES } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { personRoleLabel } from "@/lib/labels";
import {
  requestPortalPersonAction,
  type PortalOrganisationFormState,
} from "./actions";

const initialState: PortalOrganisationFormState = { error: null };

export function PortalRequestPersonForm({ onCancel }: { onCancel: () => void }) {
  const [state, action, pending] = useActionState(
    requestPortalPersonAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-5">
      <p className="text-sm text-gray-600">
        Usman will confirm their email and enable Portal before they can sign
        in.
      </p>
      <div>
        <label htmlFor="request-person-name" className={labelClassName}>
          Name
        </label>
        <input
          id="request-person-name"
          name="name"
          required
          maxLength={200}
          className={fieldClassName}
          autoComplete="name"
        />
      </div>
      <div>
        <label htmlFor="request-person-role" className={labelClassName}>
          Role
        </label>
        <select
          id="request-person-role"
          name="role"
          required
          defaultValue=""
          className={fieldClassName}
        >
          <option value="">Choose role</option>
          {PERSON_ROLES.map((role) => (
            <option key={role} value={role}>
              {personRoleLabel(role)}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="request-person-email" className={labelClassName}>
            Email (required)
          </label>
          <input
            id="request-person-email"
            name="email"
            type="email"
            required
            maxLength={320}
            className={fieldClassName}
            autoComplete="email"
            placeholder="Needed for Portal access"
          />
        </div>
        <div>
          <label htmlFor="request-person-phone" className={labelClassName}>
            Phone
          </label>
          <input
            id="request-person-phone"
            name="phone"
            type="tel"
            maxLength={40}
            className={fieldClassName}
            autoComplete="tel"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-dark-950">
        <input
          type="checkbox"
          name="isDecisionMaker"
          className="h-4 w-4 rounded border-gray-200 text-gold-500 focus:ring-gold-500"
        />
        Decision-maker
      </label>
      <FormError>{state.error}</FormError>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Request person"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
