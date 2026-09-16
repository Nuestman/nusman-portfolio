"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, buttonClassName } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import {
  startPortalProjectAction,
  type PortalFormState,
} from "@/app/portal/projects/actions";

const initialState: PortalFormState = { error: null };

export function PortalStartProjectForm({
  clientName,
  organisation,
  personName,
}: {
  clientName: string;
  organisation: string | null;
  personName: string;
}) {
  const [state, action, pending] = useActionState(
    startPortalProjectAction,
    initialState,
  );

  return (
    <form action={action} className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
        <p>
          Requesting as{" "}
          <span className="font-medium text-dark-950">{personName}</span>
          {" · "}
          <span className="font-medium text-dark-950">{clientName}</span>
          {organisation ? (
            <>
              {" · "}
              <span className="font-medium text-dark-950">{organisation}</span>
            </>
          ) : null}
        </p>
        <p className="mt-1 text-gray-500">
          Your contact and organisation stay on file — no need to re-enter them.
        </p>
      </div>

      <div>
        <label htmlFor="portal-start-problem" className={labelClassName}>
          What&apos;s the problem?
        </label>
        <textarea
          id="portal-start-problem"
          name="problem"
          rows={3}
          required
          minLength={10}
          maxLength={2000}
          className={fieldClassName}
          placeholder="What needs to be built or fixed?"
        />
      </div>

      <div>
        <label htmlFor="portal-start-who-for" className={labelClassName}>
          Who is it for (the users)?
        </label>
        <textarea
          id="portal-start-who-for"
          name="whoFor"
          rows={2}
          required
          minLength={5}
          maxLength={500}
          className={fieldClassName}
          placeholder="e.g. your clinic staff, patients, customers, your own team"
        />
      </div>

      <div>
        <label htmlFor="portal-start-success" className={labelClassName}>
          What does success look like?
        </label>
        <textarea
          id="portal-start-success"
          name="successLooksLike"
          rows={3}
          required
          minLength={10}
          maxLength={2000}
          className={fieldClassName}
          placeholder="How will you know it worked?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="portal-start-timeline" className={labelClassName}>
            Timeline{" "}
            <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            id="portal-start-timeline"
            name="timeline"
            maxLength={200}
            className={fieldClassName}
            placeholder="e.g. this month, Q2, flexible"
          />
        </div>
        <div>
          <label htmlFor="portal-start-budget" className={labelClassName}>
            Budget range{" "}
            <span className="font-normal text-gray-500">(optional)</span>
          </label>
          <input
            id="portal-start-budget"
            name="budget"
            maxLength={200}
            className={fieldClassName}
            placeholder="e.g. under $2k, open"
          />
        </div>
      </div>

      <FormError>{state.error}</FormError>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send project request"}
        </Button>
        <Link href="/projects" className={buttonClassName("secondary")}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
