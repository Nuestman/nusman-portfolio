"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createProductAction, type FormState } from "@/app/products/actions";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";

const initialState: FormState = { error: null };

export function NewProductForm() {
  const [state, action, pending] = useActionState(
    createProductAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="title" className={labelClassName}>
          Title
        </label>
        <input id="title" name="title" required className={fieldClassName} />
      </div>
      <div>
        <label htmlFor="problemSentence" className={labelClassName}>
          What it is
        </label>
        <textarea
          id="problemSentence"
          name="problemSentence"
          rows={3}
          className={fieldClassName}
          placeholder="One sentence. The app still lives on its own database."
        />
      </div>
      <div>
        <label htmlFor="successLooksLike" className={labelClassName}>
          Success looks like
        </label>
        <textarea
          id="successLooksLike"
          name="successLooksLike"
          rows={3}
          className={fieldClassName}
        />
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add product"}
      </Button>
    </form>
  );
}
