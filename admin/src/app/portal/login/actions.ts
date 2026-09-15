"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  getPortalSessionPayload,
} from "@/lib/portal-auth";
import { revokePortalSession } from "@/lib/current-person";
import { recordAuditSafe } from "@/lib/audit";
import {
  clearLoginFailures,
  loginIsBlocked,
  recordLoginFailure,
} from "@/lib/login-limit";
import { looksLikeEmail, readTrimmed } from "@/lib/forms";
import { findClientPersonByEmail } from "@/db/queries";
import { sendPortalMagicLinkEmail } from "@/lib/portal-email";
import { issuePortalMagicLink } from "@/lib/portal-magic";

export type PortalLoginState = {
  error: string | null;
  sent: boolean;
  emailed: boolean;
};

async function clientKey() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip || requestHeaders.get("x-real-ip") || "local";
}

export async function requestPortalMagicLink(
  _previous: PortalLoginState,
  formData: FormData,
): Promise<PortalLoginState> {
  const key = await clientKey();
  if (loginIsBlocked(key)) {
    return {
      error: "Too many attempts. Wait 15 minutes, then try again.",
      sent: false,
      emailed: false,
    };
  }

  const email = readTrimmed(formData, "email").toLowerCase();
  if (!looksLikeEmail(email)) {
    return { error: "Enter a valid email.", sent: false, emailed: false };
  }

  const match = await findClientPersonByEmail(email).catch(() => null);
  if (!match) {
    recordLoginFailure(key);
    return {
      error:
        "We don't recognize that email — this portal is for people already building with Usman. Start a project first, then come back when the door's unlocked for you.",
      sent: false,
      emailed: false,
    };
  }

  if (!match.person.portalEnabled) {
    return {
      error:
        "Portal access is not enabled for that email yet. Ask Usman to turn it on.",
      sent: false,
      emailed: false,
    };
  }

  const issued = await issuePortalMagicLink(match.person.id);
  if (!issued) {
    return {
      error: "Could not create a sign-in link. Try again, or ask Usman.",
      sent: false,
      emailed: false,
    };
  }

  const mailed = await sendPortalMagicLinkEmail({
    to: email,
    name: match.person.name,
    url: issued.url,
  });

  clearLoginFailures(key);
  await recordAuditSafe({
    action: "portal.invite-request",
    summary: mailed.sent
      ? `Portal magic link emailed to ${match.person.name}.`
      : `Portal magic link created for ${match.person.name} (copy from Desk if needed).`,
    entityType: "person",
    entityId: match.person.id,
    actorEmail: email,
  });

  return {
    error: mailed.error
      ? `Link ready, but email failed: ${mailed.error}. Ask Usman to paste the link.`
      : null,
    sent: true,
    emailed: mailed.sent,
  };
}

export async function portalLogout() {
  const payload = await getPortalSessionPayload();
  await revokePortalSession();
  await recordAuditSafe({
    action: "portal.logout",
    summary: "Portal signed out.",
    entityType: "session",
    entityId: payload?.personId ?? null,
  });
  redirect("/login");
}
