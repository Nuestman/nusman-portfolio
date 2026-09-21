"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { EmailVerifyPrompt } from "@/components/email-verify-prompt";
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
  next,
}: {
  person: {
    id: string;
    clientId: string;
    name: string;
    email: string | null;
    portalEnabled: boolean;
    emailVerified: boolean;
  };
  next: string;
}) {
  const [enableState, enableAction, enablePending] = useActionState(
    setPersonPortalEnabledAction,
    initialState,
  );
  const [inviteState, inviteAction, invitePending] = useActionState(
    invitePortalPersonAction,
    initialState,
  );
  const needsVerify = Boolean(person.email) && !person.emailVerified;

  return (
    <div className="space-y-6">
      {needsVerify && person.email ? (
        <EmailVerifyPrompt
          personId={person.id}
          clientId={person.clientId}
          email={person.email}
          next={next}
          portalEnabled={person.portalEnabled}
        />
      ) : null}

      <form action={enableAction} className="space-y-4">
        <input type="hidden" name="personId" value={person.id} />
        <input type="hidden" name="clientId" value={person.clientId} />
        <label className="flex items-center gap-2 text-sm text-dark-950">
          <input
            type="checkbox"
            name={needsVerify ? undefined : "portalEnabled"}
            defaultChecked={person.portalEnabled}
            disabled={needsVerify}
            className="h-4 w-4 rounded border-gray-200 text-gold-500 focus:ring-gold-500 disabled:opacity-50"
          />
          Portal access enabled
        </label>
        <p className="text-sm text-gray-600">
          {!person.email
            ? "Add an email on this person before enabling portal."
            : needsVerify
              ? "Confirm the email above before turning portal on."
              : `Magic links go to ${person.email}.`}
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
        {needsVerify && !person.portalEnabled ? null : (
          <Button type="submit" variant="secondary" disabled={enablePending}>
            {enablePending
              ? "Saving…"
              : needsVerify
                ? "Turn portal off"
                : "Save portal access"}
          </Button>
        )}
      </form>

      {person.portalEnabled && person.email && person.emailVerified ? (
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
