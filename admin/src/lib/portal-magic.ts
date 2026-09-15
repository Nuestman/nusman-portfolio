import { createHash, randomBytes } from "node:crypto";
import {
  createPortalMagicLink,
  getPortalPerson,
  markPortalMagicLinkUsed,
  getPortalMagicLinkByHash,
} from "@/db/queries";
import { portalPublicBaseUrl } from "@/lib/portal-host";

const MAGIC_LINK_HOURS = 24;

export function hashMagicToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function issuePortalMagicLink(personId: string): Promise<{
  url: string;
  expiresAt: Date;
} | null> {
  const row = await getPortalPerson(personId);
  if (!row || !row.person.portalEnabled || !row.person.email) {
    return null;
  }

  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + MAGIC_LINK_HOURS);

  await createPortalMagicLink({
    personId,
    tokenHash: hashMagicToken(token),
    expiresAt,
  });

  return {
    url: `${portalPublicBaseUrl()}/auth/magic?token=${encodeURIComponent(token)}`,
    expiresAt,
  };
}

export async function consumePortalMagicToken(token: string) {
  const row = await getPortalMagicLinkByHash(hashMagicToken(token));
  if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) {
    return null;
  }

  const person = await getPortalPerson(row.personId);
  if (!person || !person.person.portalEnabled) {
    return null;
  }

  await markPortalMagicLinkUsed(row.id);
  return person.person;
}
