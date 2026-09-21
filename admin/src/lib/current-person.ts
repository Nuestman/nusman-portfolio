import { redirect } from "next/navigation";
import {
  clearPortalSessionCookie,
  getPortalSessionPayload,
} from "@/lib/portal-auth";
import { personCanUsePortal } from "@/lib/person-email-verify";
import { deletePortalSession, getPortalPerson, getPortalSessionRow } from "@/db/queries";

export async function getPortalSessionPerson() {
  const payload = await getPortalSessionPayload();
  if (!payload?.sessionId || !payload.personId) {
    return null;
  }

  const session = await getPortalSessionRow(payload.sessionId);
  if (!session || session.expiresAt.getTime() < Date.now()) {
    return null;
  }
  if (session.personId !== payload.personId) {
    return null;
  }

  const row = await getPortalPerson(session.personId);
  if (!row || !personCanUsePortal(row.person)) {
    return null;
  }

  return {
    person: row.person,
    client: row.client,
    sessionId: session.id,
  };
}

export async function requirePortalPerson() {
  const current = await getPortalSessionPerson();
  if (current) {
    return current;
  }
  await clearPortalSessionCookie();
  redirect("/login");
}

export async function revokePortalSession() {
  const payload = await getPortalSessionPayload();
  if (payload?.sessionId) {
    await deletePortalSession(payload.sessionId).catch(() => undefined);
  }
  await clearPortalSessionCookie();
}
