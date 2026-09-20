"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { OPERATOR_TITLE_OPTIONS } from "@/lib/form-options";
import { createOperatorAction, type FormState } from "./actions";

const initialState: FormState = { error: null };

export function AddOperatorForm() {
  const [state, action, pending] = useActionState(
    createOperatorAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="operator-name" className={labelClassName}>
          Name
        </label>
        <input
          id="operator-name"
          name="name"
          required
          autoComplete="name"
          className={fieldClassName}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="operator-email" className={labelClassName}>
            Email
          </label>
          <input
            id="operator-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={fieldClassName}
          />
        </div>
        <div>
          <label htmlFor="operator-password" className={labelClassName}>
            Password
          </label>
          <input
            id="operator-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={fieldClassName}
          />
        </div>
      </div>
      <div>
        <label htmlFor="operator-title" className={labelClassName}>
          Title (optional)
        </label>
        <select
          id="operator-title"
          name="title"
          defaultValue=""
          className={fieldClassName}
        >
          <option value="">Not set</option>
          {OPERATOR_TITLE_OPTIONS.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add operator"}
      </Button>
    </form>
  );
}
