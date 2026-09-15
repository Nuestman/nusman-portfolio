"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import {
  requestPortalMagicLink,
  type PortalLoginState,
} from "@/app/portal/login/actions";

const initialState: PortalLoginState = {
  error: null,
  sent: false,
  emailed: false,
};

export function PortalLoginForm() {
  const [state, formAction, pending] = useActionState(
    requestPortalMagicLink,
    initialState,
  );

  if (state.sent) {
    return (
      <p className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-800">
        {state.emailed
          ? "Check your inbox for a one-time sign-in link."
          : "Your account was found. Ask Usman to send or paste the magic link — email is not configured on this server."}
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="portal-email" className={labelClassName}>
          Email
        </label>
        <input
          id="portal-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          className={fieldClassName}
        />
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Checking…" : "Email me a link"}
      </Button>
    </form>
  );
}
