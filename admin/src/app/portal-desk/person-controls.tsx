"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { CopyButton } from "@/app/projects/copy-templates";
import {
  invitePortalPersonAction,
  setPersonPortalEnabledAction,
  type PortalDeskState,
} from "@/app/portal-desk/actions";

const initialState: PortalDeskState = {
  error: null,
  link: null,
  emailed: false,
};

export function PortalPersonControls({
  person,
}: {
  person: {
    id: string;
    clientId: string;
    name: string;
    email: string | null;
    portalEnabled: boolean;
  };
}) {
  const [enableState, enableAction, enablePending] = useActionState(
    setPersonPortalEnabledAction,
    initialState,
  );
  const [inviteState, inviteAction, invitePending] = useActionState(
    invitePortalPersonAction,
    initialState,
  );

  return (
    <div className="space-y-6">
      <form action={enableAction} className="space-y-4">
        <input type="hidden" name="personId" value={person.id} />
        <input type="hidden" name="clientId" value={person.clientId} />
        <label className="flex items-center gap-2 text-sm text-dark-950">
          <input
            type="checkbox"
            name="portalEnabled"
            defaultChecked={person.portalEnabled}
            className="h-4 w-4 rounded border-gray-200 text-gold-500 focus:ring-gold-500"
          />
          Portal access enabled
        </label>
        <p className="text-sm text-gray-600">
          {person.email
            ? `Magic links go to ${person.email}.`
            : "Add an email on this person before enabling portal."}
        </p>
        <FormError>{enableState.error}</FormError>
        {enableState.emailed ? (
          <p className="text-sm text-gray-700">
            Welcome email with a sign-in link was sent.
          </p>
        ) : null}
        {enableState.link && !enableState.emailed ? (
          <div className="space-y-3 rounded-lg bg-gray-50 px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                One-time link
              </p>
              <CopyButton text={enableState.link} label="Copy link" />
            </div>
            <p className="break-all text-sm text-dark-950">{enableState.link}</p>
          </div>
        ) : null}
        <Button type="submit" variant="secondary" disabled={enablePending}>
          {enablePending ? "Saving…" : "Save portal access"}
        </Button>
      </form>

      {person.portalEnabled && person.email ? (
        <form action={inviteAction} className="space-y-4">
          <input type="hidden" name="personId" value={person.id} />
          <input type="hidden" name="clientId" value={person.clientId} />
          <p className="text-sm text-gray-700">
            Create a one-time link, then use{" "}
            <span className="font-medium">Copy link</span>. Local links use{" "}
            <span className="font-medium">portal.localhost:3000</span>.
          </p>
          <FormError>{inviteState.error}</FormError>
          <Button type="submit" disabled={invitePending}>
            {invitePending ? "Creating…" : "Create magic link"}
          </Button>
          {inviteState.emailed ? (
            <p className="text-sm text-gray-700">Email sent.</p>
          ) : null}
          {inviteState.link ? (
            <div className="space-y-3 rounded-lg bg-gray-50 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  One-time link
                </p>
                <CopyButton text={inviteState.link} label="Copy link" />
              </div>
              <p className="break-all text-sm text-dark-950">{inviteState.link}</p>
            </div>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
