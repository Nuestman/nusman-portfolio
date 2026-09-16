"use client";

import { useActionState } from "react";
import { ConfirmClick } from "@/components/confirm-submit";
import { FormError } from "@/components/form-error";
import { buttonClassName } from "@/components/ui/button";
import {
  recordKnownProductsAction,
  type FormState,
} from "@/app/products/actions";

const initialState: FormState = { error: null };

export function RecordKnownProducts() {
  const [state, action, pending] = useActionState(
    recordKnownProductsAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-3">
      <FormError>{state.error}</FormError>
      <ConfirmClick
        message="Record the known products that are not on Desk yet?"
        confirmLabel="Record"
        className={buttonClassName("outline")}
        disabled={pending}
      >
        {pending ? "Recording…" : "Record known products"}
      </ConfirmClick>
    </form>
  );
}
