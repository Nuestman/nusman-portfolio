"use client";

import { useActionState } from "react";
import { FilePickField } from "@/components/file-pick-field";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import {
  updatePortalProfilePhotoAction,
  type PortalProfileFormState,
} from "./actions";

const initialState: PortalProfileFormState = { error: null };

export function PortalPhotoForm() {
  const [state, action, pending] = useActionState(
    updatePortalProfilePhotoAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-4">
      <FilePickField
        id="photo"
        name="photo"
        required
        disabled={pending}
        accept="image/png,image/jpeg,image/webp"
        label="Photo"
        labelClassName={labelClassName}
        inputClassName={fieldClassName}
        hint={
          <p className="mt-2 text-sm text-gray-600">
            PNG, JPEG, or WebP. Under 400 KB. Stored on Vercel Blob.
          </p>
        }
      />
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Uploading…" : "Save photo"}
      </Button>
    </form>
  );
}
