"use client";

import { useActionState } from "react";
import { PERSON_ROLES } from "@/db/schema";
import type { PersonRole } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {
  createPersonAction,
  updatePersonAction,
  type FormState,
} from "@/app/clients/actions";
import { personRoleLabel } from "@/lib/labels";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";

const initialState: FormState = { error: null };

type PersonValues = {
  id?: string;
  clientId: string;
  name: string;
  email: string;
  phone: string;
  role: PersonRole | "";
  isDecisionMaker: boolean;
  notes: string;
};

export function PersonForm({
  person,
  submitLabel,
}: {
  person: PersonValues;
  submitLabel: string;
}) {
  const action = person.id ? updatePersonAction : createPersonAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {person.id ? <input type="hidden" name="id" value={person.id} /> : null}
      <input type="hidden" name="clientId" value={person.clientId} />
      <div>
        <label htmlFor="person-name" className={labelClassName}>
          Name
        </label>
        <input
          id="person-name"
          name="name"
          required
          autoComplete="name"
          defaultValue={person.name}
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="role" className={labelClassName}>
          Role
        </label>
        <select
          id="role"
          name="role"
          required
          defaultValue={person.role}
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
          <label htmlFor="person-email" className={labelClassName}>
            Email
          </label>
          <input
            id="person-email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={person.email}
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="person-phone" className={labelClassName}>
            Phone
          </label>
          <input
            id="person-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={person.phone}
            className={fieldClassName}
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-dark-950">
        <input
          type="checkbox"
          name="isDecisionMaker"
          defaultChecked={person.isDecisionMaker}
          className="h-4 w-4 rounded border-gray-200 text-gold-500 focus:ring-gold-500"
        />
        Decision-maker
      </label>
      <div>
        <label htmlFor="person-notes" className={labelClassName}>
          Notes
        </label>
        <textarea
          id="person-notes"
          name="notes"
          rows={3}
          defaultValue={person.notes}
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
