"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { linkClassName } from "@/lib/links";
import { cn } from "@/lib/utils";
import {
  updateDeskNotificationAction,
  type FormState,
} from "@/app/notifications/actions";

const initialState: FormState = { error: null };

const tightFieldClassName = cn(fieldClassName, "px-3 py-2 text-sm");
const tightLabelClassName = cn(labelClassName, "mb-1");

export function DeskNotificationEditForm({
  id,
  title,
  body,
  href,
}: {
  id: string;
  title: string;
  body: string;
  href: string | null;
}) {
  const [state, action, pending] = useActionState(
    updateDeskNotificationAction,
    initialState,
  );

  return (
    <form action={action} className="mx-auto max-w-xl space-y-3">
      <input type="hidden" name="id" value={id} />
      {state.error ? (
        <p className="rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-900">
          {state.error}
        </p>
      ) : null}

      <div>
        <label htmlFor="title" className={tightLabelClassName}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={title}
          className={tightFieldClassName}
        />
      </div>

      <div>
        <label htmlFor="body" className={tightLabelClassName}>
          Body
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={3}
          maxLength={4000}
          defaultValue={body}
          className={tightFieldClassName}
        />
      </div>

      <div>
        <label htmlFor="href" className={tightLabelClassName}>
          Link (optional)
        </label>
        <input
          id="href"
          name="href"
          defaultValue={href ?? ""}
          className={tightFieldClassName}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        <Link href="/notifications" className={linkClassName("back")}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
