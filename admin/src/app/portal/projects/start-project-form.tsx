"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Button, buttonClassName } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import {
  BUDGET_OPTIONS,
  NOT_SURE_YET,
  TIMELINE_MANUAL_VALUE,
  TIMELINE_OPTIONS,
} from "@/lib/form-options";
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
  const [timelineChoice, setTimelineChoice] = useState(NOT_SURE_YET);
  const [timelineManual, setTimelineManual] = useState("");

  const timelineValue =
    timelineChoice === TIMELINE_MANUAL_VALUE
      ? timelineManual.trim()
      : timelineChoice || NOT_SURE_YET;

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="timeline" value={timelineValue} />

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
          placeholder="e.g. appointments get lost on WhatsApp, staff double-book, reports take hours"
        />
      </div>

      <div>
        <label htmlFor="portal-start-want-built" className={labelClassName}>
          What do you want built or fixed?
        </label>
        <textarea
          id="portal-start-want-built"
          name="wantBuilt"
          rows={3}
          required
          minLength={10}
          maxLength={2000}
          className={fieldClassName}
          placeholder="e.g. a simple booking app, a staff dashboard, an automated report"
        />
      </div>

      <div>
        <label htmlFor="portal-start-who-for" className={labelClassName}>
          Who are going to use it (their roles; eg. manager, tenant, employee, etc.)?
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
            Timeline
          </label>
          <select
            id="portal-start-timeline"
            value={timelineChoice}
            className={fieldClassName}
            onChange={(event) => {
              setTimelineChoice(event.target.value);
              if (event.target.value !== TIMELINE_MANUAL_VALUE) {
                setTimelineManual("");
              }
            }}
          >
            {TIMELINE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
            <option value={TIMELINE_MANUAL_VALUE}>Enter manually</option>
          </select>
          {timelineChoice === TIMELINE_MANUAL_VALUE ? (
            <input
              id="portal-start-timeline-manual"
              type="text"
              value={timelineManual}
              onChange={(event) => setTimelineManual(event.target.value)}
              required
              maxLength={200}
              className={`${fieldClassName} mt-2`}
              placeholder="e.g. before Easter, mid-July"
            />
          ) : null}
        </div>
        <div>
          <label htmlFor="portal-start-budget" className={labelClassName}>
            Budget range
          </label>
          <select
            id="portal-start-budget"
            name="budget"
            defaultValue={NOT_SURE_YET}
            className={fieldClassName}
          >
            {BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
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
