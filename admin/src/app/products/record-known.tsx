"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
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
      <Button
        type="submit"
        variant="outline"
        disabled={pending}
        onClick={(event) => {
          if (
            !window.confirm(
              "Record the known products that are not on Desk yet?",
            )
          ) {
            event.preventDefault();
          }
        }}
      >
        {pending ? "Recording…" : "Record known products"}
      </Button>
    </form>
  );
}
