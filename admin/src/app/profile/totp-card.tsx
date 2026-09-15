"use client";

import { useActionState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { fieldClassName, labelClassName } from "@/lib/forms";
import {
  confirmTotpAction,
  disableTotpAction,
  startTotpAction,
  type TotpState,
} from "./actions";

const initialState: TotpState = {
  error: null,
  secret: null,
  qrDataUrl: null,
  recoveryCodes: null,
};

export function TotpCard({ enabled }: { enabled: boolean }) {
  const [setup, startAction, starting] = useActionState(
    startTotpAction,
    initialState,
  );
  const [confirm, confirmAction, confirming] = useActionState(
    confirmTotpAction,
    initialState,
  );
  const [disable, disableAction, disabling] = useActionState(
    disableTotpAction,
    initialState,
  );

  const secret = confirm.secret ?? setup.secret;
  const qrDataUrl = confirm.qrDataUrl ?? setup.qrDataUrl;
  const recoveryCodes = confirm.recoveryCodes;
  const error = confirm.error ?? setup.error ?? disable.error;

  if (recoveryCodes && recoveryCodes.length > 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-700">
          Authenticator is on. Save these recovery codes somewhere safe. They
          will not be shown again.
        </p>
        <ul className="grid gap-2 font-mono text-sm sm:grid-cols-2">
          {recoveryCodes.map((code) => (
            <li
              key={code}
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
            >
              {code}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (enabled) {
    return (
      <form action={disableAction} className="space-y-5">
        <p className="text-sm text-gray-700">
          Sign-in asks for an authenticator code after the password.
        </p>
        <div>
          <label htmlFor="totpDisableCode" className={labelClassName}>
            Authenticator or recovery code
          </label>
          <input
            id="totpDisableCode"
            name="code"
            autoComplete="one-time-code"
            required
            className={fieldClassName}
          />
        </div>
        <FormError>{error}</FormError>
        <Button type="submit" variant="secondary" disabled={disabling}>
          {disabling ? "Turning off…" : "Turn off"}
        </Button>
      </form>
    );
  }

  if (secret) {
    return (
      <form action={confirmAction} className="space-y-5">
        <input type="hidden" name="secret" value={secret} />
        {qrDataUrl ? (
          <input type="hidden" name="qrDataUrl" value={qrDataUrl} />
        ) : null}
        <p className="text-sm text-gray-700">
          Scan this with your authenticator app, then enter the 6-digit code.
        </p>
        {qrDataUrl ? (
          <Image
            src={qrDataUrl}
            alt="Authenticator QR code"
            width={220}
            height={220}
            unoptimized
            className="rounded-lg border border-gray-200 bg-white p-2"
          />
        ) : null}
        <p className="break-all font-mono text-sm text-gray-700">{secret}</p>
        <div>
          <label htmlFor="totpConfirmCode" className={labelClassName}>
            Authenticator code
          </label>
          <input
            id="totpConfirmCode"
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            required
            className={fieldClassName}
          />
        </div>
        <FormError>{error}</FormError>
        <Button type="submit" disabled={confirming}>
          {confirming ? "Checking…" : "Turn on"}
        </Button>
      </form>
    );
  }

  return (
    <form action={startAction} className="space-y-4">
      <p className="text-sm text-gray-700">
        After the password, Desk will ask for a code from an authenticator app.
      </p>
      <FormError>{error}</FormError>
      <Button type="submit" disabled={starting}>
        {starting ? "Preparing…" : "Set up authenticator"}
      </Button>
    </form>
  );
}
