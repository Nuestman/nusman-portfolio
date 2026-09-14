"use client";

import { useActionState } from "react";
import { CLIENT_SOURCES } from "@/db/schema";
import type { ClientSource } from "@/db/schema";
import { Button } from "@/components/ui/button";
import {
  createClientAction,
  updateClientAction,
  type FormState,
} from "@/app/clients/actions";
import { clientSourceLabel } from "@/lib/labels";
import { fieldClassName, labelClassName } from "@/lib/forms";

const initialState: FormState = { error: null };

type ClientValues = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  organisation: string;
  source: ClientSource | "";
  notes: string;
};

export function ClientForm({
  client,
  submitLabel,
}: {
  client?: ClientValues;
  submitLabel: string;
}) {
  const action = client?.id ? updateClientAction : createClientAction;
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {client?.id ? <input type="hidden" name="id" value={client.id} /> : null}
      <div>
        <label htmlFor="name" className={labelClassName}>
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={client?.name ?? ""}
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="organisation" className={labelClassName}>
          Organisation
        </label>
        <input
          id="organisation"
          name="organisation"
          defaultValue={client?.organisation ?? ""}
          className={fieldClassName}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClassName}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={client?.email ?? ""}
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClassName}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            defaultValue={client?.phone ?? ""}
            className={fieldClassName}
          />
        </div>
      </div>
      <div>
        <label htmlFor="source" className={labelClassName}>
          Source
        </label>
        <select
          id="source"
          name="source"
          defaultValue={client?.source ?? ""}
          className={fieldClassName}
        >
          <option value="">Not set</option>
          {CLIENT_SOURCES.map((source) => (
            <option key={source} value={source}>
              {clientSourceLabel(source)}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="notes" className={labelClassName}>
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          defaultValue={client?.notes ?? ""}
          className={fieldClassName}
        />
      </div>
      {state.error ? (
        <p className="rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
