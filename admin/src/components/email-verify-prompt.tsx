"use client";

import {
  confirmPersonEmailAction,
  resendPersonEmailAction,
} from "@/app/portal-desk/actions";
import { buttonClassName } from "@/components/ui/button";

export function EmailVerifyPrompt({
  personId,
  clientId,
  email,
  next,
  portalEnabled,
}: {
  personId: string;
  clientId: string;
  email: string;
  next: string;
  portalEnabled?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gold-500/35 bg-gold-500/10 px-4 py-4">
      <p className="font-medium text-dark-950">Confirm this email first</p>
      <p className="mt-1 text-sm text-gray-700">
        Portal access cannot be turned on — and magic links will not work —
        until <span className="font-medium">{email}</span> is confirmed.
        {portalEnabled
          ? " Portal is flagged on, but they cannot sign in yet."
          : null}{" "}
        Confirm email marks it verified and emails them. Resend confirmation
        asks them to click a link.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <form action={confirmPersonEmailAction}>
          <input type="hidden" name="personId" value={personId} />
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="next" value={next} />
          <button type="submit" className={buttonClassName("default", "sm")}>
            Confirm email
          </button>
        </form>
        <form action={resendPersonEmailAction}>
          <input type="hidden" name="personId" value={personId} />
          <input type="hidden" name="clientId" value={clientId} />
          <input type="hidden" name="next" value={next} />
          <button type="submit" className={buttonClassName("outline", "sm")}>
            Resend confirmation
          </button>
        </form>
      </div>
    </div>
  );
}
