"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createProjectAction, type FormState } from "@/app/projects/actions";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import { WANT_BUILT_LABEL } from "@/lib/labels";

const initialState: FormState = { error: null };

export function NewProjectForm({
  clients,
  selectedClientId,
}: {
  clients: Array<{ id: string; name: string }>;
  selectedClientId?: string;
}) {
  const [state, action, pending] = useActionState(
    createProjectAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="clientId" className={labelClassName}>
          Client
        </label>
        <select
          id="clientId"
          name="clientId"
          required
          defaultValue={selectedClientId ?? ""}
          className={fieldClassName}
        >
          <option value="">Pick a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="title" className={labelClassName}>
          Title
        </label>
        <input
          id="title"
          name="title"
          required
          className={fieldClassName}
        />
      </div>
      <div>
        <label htmlFor="problemSentence" className={labelClassName}>
          Problem sentence
        </label>
        <textarea
          id="problemSentence"
          name="problemSentence"
          rows={3}
          className={fieldClassName}
          placeholder="The one sentence both sides can repeat."
        />
        <p className="mt-2 text-sm text-gray-500">
          Optional at Qualify. Needed before you leave Discover.
        </p>
      </div>
      <div>
        <label htmlFor="wantBuilt" className={labelClassName}>
          {WANT_BUILT_LABEL}
        </label>
        <textarea
          id="wantBuilt"
          name="wantBuilt"
          rows={3}
          className={fieldClassName}
          placeholder="After the problem is clear — the thing both sides agree to make."
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
        {pending ? "Saving…" : "Create project"}
      </Button>
    </form>
  );
}
