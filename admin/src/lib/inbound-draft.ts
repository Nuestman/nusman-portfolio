import { createHash, randomBytes } from "node:crypto";
import {
  createInboundLeadDraft,
  getInboundLeadDraftByEmailOpen,
  getInboundLeadDraftByVerifyHash,
  markInboundLeadDraftCompleted,
  upsertInboundLeadDraftPayload,
} from "@/db/queries";
import { createInboundLead } from "@/lib/inbound-create";
import { marketingPublicBaseUrl } from "@/lib/portal-host";
import type { ClientSource } from "@/db/schema";

const VERIFY_HOURS = 48;

export function hashInboundToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function newToken() {
  return randomBytes(32).toString("base64url");
}

export type InboundDraftBrief = {
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  source: ClientSource;
  sourceOther: string | null;
  problem: string;
  wantBuilt: string;
  whoFor: string;
  successLooksLike: string;
  timeline: string | null;
  budget: string | null;
};

export async function issueInboundVerifyDraft(input: InboundDraftBrief): Promise<{
  draftId: string;
  verifyUrl: string;
  expiresAt: Date;
}> {
  const email = input.email.trim().toLowerCase();
  const token = newToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + VERIFY_HOURS);

  const payload = {
    name: input.name,
    phone: input.phone,
    organisation: input.organisation,
    source: input.source,
    sourceOther: input.sourceOther,
    problem: input.problem,
    wantBuilt: input.wantBuilt,
    whoFor: input.whoFor,
    successLooksLike: input.successLooksLike,
    timeline: input.timeline,
    budget: input.budget,
    verifyTokenHash: hashInboundToken(token),
    expiresAt,
  };

  const existing = await getInboundLeadDraftByEmailOpen(email);
  if (existing) {
    await upsertInboundLeadDraftPayload(existing.id, payload);
    return {
      draftId: existing.id,
      verifyUrl: `${marketingPublicBaseUrl()}/start/continue?token=${encodeURIComponent(token)}`,
      expiresAt,
    };
  }

  const draftId = await createInboundLeadDraft({
    email,
    ...payload,
  });

  return {
    draftId,
    verifyUrl: `${marketingPublicBaseUrl()}/start/continue?token=${encodeURIComponent(token)}`,
    expiresAt,
  };
}

/** Verify email → create Desk lead + mark draft complete. */
export async function finalizeInboundDraftFromToken(token: string): Promise<{
  name: string;
  email: string;
  alreadyDone: boolean;
} | null> {
  const draft = await getInboundLeadDraftByVerifyHash(hashInboundToken(token));
  if (!draft || draft.expiresAt.getTime() < Date.now()) {
    return null;
  }

  if (draft.completedAt && draft.projectId) {
    return {
      name: draft.name,
      email: draft.email,
      alreadyDone: true,
    };
  }

  if (
    !draft.problem?.trim() ||
    !draft.wantBuilt?.trim() ||
    !draft.whoFor?.trim() ||
    !draft.successLooksLike?.trim()
  ) {
    return null;
  }

  const created = await createInboundLead({
    name: draft.name,
    email: draft.email,
    phone: draft.phone,
    organisation: draft.organisation,
    source: draft.source,
    sourceOther: draft.sourceOther,
    problem: draft.problem,
    wantBuilt: draft.wantBuilt,
    whoFor: draft.whoFor,
    successLooksLike: draft.successLooksLike,
    timeline: draft.timeline,
    budget: draft.budget,
  });

  await markInboundLeadDraftCompleted(draft.id, created.projectId);

  return {
    name: draft.name,
    email: draft.email,
    alreadyDone: false,
  };
}

export async function resendInboundVerify(emailRaw: string): Promise<{
  verifyUrl: string;
  name: string;
} | null> {
  const email = emailRaw.trim().toLowerCase();
  const existing = await getInboundLeadDraftByEmailOpen(email);
  if (!existing || existing.completedAt) {
    return null;
  }

  const token = newToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + VERIFY_HOURS);

  await upsertInboundLeadDraftPayload(existing.id, {
    name: existing.name,
    phone: existing.phone,
    organisation: existing.organisation,
    source: existing.source,
    sourceOther: existing.sourceOther,
    problem: existing.problem,
    wantBuilt: existing.wantBuilt,
    whoFor: existing.whoFor,
    successLooksLike: existing.successLooksLike,
    timeline: existing.timeline,
    budget: existing.budget,
    verifyTokenHash: hashInboundToken(token),
    expiresAt,
  });

  return {
    name: existing.name,
    verifyUrl: `${marketingPublicBaseUrl()}/start/continue?token=${encodeURIComponent(token)}`,
  };
}
