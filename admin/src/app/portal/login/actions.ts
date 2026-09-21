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
import { sendPersonEmailVerifyEmail, sendPortalMagicLinkEmail } from "@/lib/portal-email";
import { issuePortalMagicLink } from "@/lib/portal-magic";
import {
  isPersonEmailVerified,
  issuePersonEmailVerify,
} from "@/lib/person-email-verify";

export type PortalLoginState = {
  error: string | null;
  sent: boolean;
  emailed: boolean;
  verify: boolean;
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
      verify: false,
    };
  }

  const email = readTrimmed(formData, "email").toLowerCase();
  if (!looksLikeEmail(email)) {
    return {
      error: "Enter a valid email.",
      sent: false,
      emailed: false,
      verify: false,
    };
  }

  const match = await findClientPersonByEmail(email).catch(() => null);
  if (!match) {
    recordLoginFailure(key);
    return {
      error:
        "We don't recognize that email — this portal is for people already building with Usman. Start a project first, then come back when the door's unlocked for you.",
      sent: false,
      emailed: false,
      verify: false,
    };
  }

  if (!isPersonEmailVerified(match.person)) {
    const issued = await issuePersonEmailVerify(match.person.id);
    if (!issued) {
      return {
        error: "Could not create a confirmation link. Try again, or ask Usman.",
        sent: false,
        emailed: false,
        verify: true,
      };
    }

    const mailed = await sendPersonEmailVerifyEmail({
      to: email,
      name: match.person.name,
      verifyUrl: issued.url,
    });

    clearLoginFailures(key);
    await recordAuditSafe({
      action: "portal.verify-request",
      summary: mailed.sent
        ? `Portal email confirmation sent to ${match.person.name}.`
        : `Portal email confirmation created for ${match.person.name} (email did not send).`,
      entityType: "person",
      entityId: match.person.id,
      actorEmail: email,
    });

    if (mailed.sent) {
      return { error: null, sent: true, emailed: true, verify: true };
    }

    return {
      error: mailed.configured
        ? `Could not send the confirmation email: ${mailed.error ?? "unknown error"}. Ask Usman to confirm the email from Desk.`
        : "Email is not configured on this server yet. Ask Usman to confirm the email from Desk.",
      sent: true,
      emailed: false,
      verify: true,
    };
  }

  if (!match.person.portalEnabled) {
    return {
      error:
        "Portal access is not enabled for that email yet. Ask Usman to turn it on.",
      sent: false,
      emailed: false,
      verify: false,
    };
  }

  const issued = await issuePortalMagicLink(match.person.id);
  if (!issued) {
    return {
      error: "Could not create a sign-in link. Try again, or ask Usman.",
      sent: false,
      emailed: false,
      verify: false,
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

  if (mailed.sent) {
    return { error: null, sent: true, emailed: true, verify: false };
  }

  return {
    error: mailed.configured
      ? `Could not send the email: ${mailed.error ?? "unknown error"}. Ask Usman to paste a magic link from Desk.`
      : "Email is not configured on this server yet. Ask Usman to send or paste the magic link.",
    sent: true,
    emailed: false,
    verify: false,
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
