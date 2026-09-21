import { createHash, randomBytes } from "node:crypto";
import {
  getPerson,
  getPersonByEmailVerifyHash,
  markPeopleEmailVerifiedByEmail,
  markPersonEmailVerified,
  setPersonEmailVerifyToken,
} from "@/db/queries";
import { portalPublicBaseUrl } from "@/lib/portal-host";

const VERIFY_HOURS = 48;

export function isPersonEmailVerified(person: {
  email: string | null;
  emailVerifiedAt: Date | null;
}): boolean {
  return Boolean(person.email?.trim() && person.emailVerifiedAt);
}

export function personCanUsePortal(person: {
  email: string | null;
  emailVerifiedAt: Date | null;
  portalEnabled: boolean;
}): boolean {
  return person.portalEnabled && isPersonEmailVerified(person);
}

export function personEmailNotice(raw: string | undefined): string | null {
  switch (raw) {
    case "person-email-confirmed":
      return "Email confirmed. A notice was sent.";
    case "person-email-confirmed-unsent":
      return "Email confirmed. The notice did not send — they still need Portal turned on to get a sign-in link.";
    case "person-email-already":
      return "This email was already confirmed.";
    case "person-email-resent":
      return "Confirmation email sent.";
    case "person-email-resend-missing":
      return "Could not create a confirmation link. Check the email on this person.";
    case "person-email-resend-failed":
      return "Could not send the confirmation email. Try again shortly.";
    case "person-email-missing":
      return "Add an email on this person first.";
    case undefined:
      return null;
    default:
      return null;
  }
}

function hashPersonEmailToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function issuePersonEmailVerify(personId: string): Promise<{
  url: string;
  email: string;
  name: string;
  expiresAt: Date;
} | null> {
  const person = await getPerson(personId);
  const email = person?.email?.trim() ?? "";
  if (!person || !email) {
    return null;
  }
  if (isPersonEmailVerified(person)) {
    return null;
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + VERIFY_HOURS);
  await setPersonEmailVerifyToken(personId, {
    emailVerifyTokenHash: hashPersonEmailToken(token),
    emailVerifyExpiresAt: expiresAt,
  });

  return {
    url: `${portalPublicBaseUrl()}/auth/verify-email?token=${encodeURIComponent(token)}`,
    email,
    name: person.name,
    expiresAt,
  };
}

export async function consumePersonEmailVerifyToken(token: string) {
  const person = await getPersonByEmailVerifyHash(hashPersonEmailToken(token));
  if (
    !person ||
    !person.emailVerifyExpiresAt ||
    person.emailVerifyExpiresAt.getTime() < Date.now()
  ) {
    return null;
  }

  await markPersonEmailVerified(person.id);
  await markPeopleEmailVerifiedByEmail(person.email ?? "");
  return person;
}
