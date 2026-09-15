"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { verifyTotpLogin, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

export function TotpForm({ from }: { from?: string }) {
  const [state, action, pending] = useActionState(verifyTotpLogin, initialState);

  return (
    <form action={action} className="space-y-5">
      {from ? <input type="hidden" name="from" value={from} /> : null}
      <p className="text-sm text-gray-600">
        Enter the 6-digit code from your authenticator app, or a recovery code.
      </p>
      <div>
        <label htmlFor="code" className={labelClassName}>
          Authenticator code
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          required
          className={fieldClassName}
        />
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Checking…" : "Continue"}
      </Button>
    </form>
  );
}
