"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { OPERATOR_TITLE_OPTIONS } from "@/lib/form-options";
import { updateProfileAction, type FormState } from "./actions";

const initialState: FormState = { error: null };

export function ProfileForm({
  user,
}: {
  user: {
    name: string;
    email: string;
    title: string | null;
    phone: string | null;
  };
}) {
  const [state, action, pending] = useActionState(
    updateProfileAction,
    initialState,
  );
  const titleValue = user.title ?? "";
  const knownTitle = (OPERATOR_TITLE_OPTIONS as readonly string[]).includes(
    titleValue,
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="name" className={labelClassName}>
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          defaultValue={user.name}
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="title" className={labelClassName}>
          Title
        </label>
        <select
          id="title"
          name="title"
          defaultValue={knownTitle ? titleValue : titleValue ? titleValue : ""}
          className={fieldClassName}
        >
          <option value="">Not set</option>
          {!knownTitle && titleValue ? (
            <option value={titleValue}>{titleValue}</option>
          ) : null}
          {OPERATOR_TITLE_OPTIONS.map((title) => (
            <option key={title} value={title}>
              {title}
            </option>
          ))}
        </select>
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
            required
            autoComplete="email"
            defaultValue={user.email}
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
            autoComplete="tel"
            defaultValue={user.phone ?? ""}
            className={fieldClassName}
          />
        </div>
      </div>
      <div>
        <label htmlFor="photo" className={labelClassName}>
          Photo
        </label>
        <input
          id="photo"
          name="photo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className={fieldClassName}
        />
        <p className="mt-2 text-sm text-gray-600">
          PNG, JPEG, or WebP. Under 400 KB. Leave empty to keep the current
          photo.
        </p>
      </div>
      <FormError>{state.error}</FormError>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
