import { createHash, randomBytes } from "node:crypto";
import {
  activateInboundProject,
  addNote,
  attachInboundLeadDraftProject,
  attachInboundLeadDraftProjectIfNull,
  claimInboundLeadDraft,
  createInboundLeadDraft,
  deleteClient,
  deleteProject,
  getInboundLeadDraftByEmailOpen,
  getInboundLeadDraftByProject,
  getInboundLeadDraftByVerifyHash,
  getOpenInboundLeadDraftByProject,
  getProject,
  upsertInboundLeadDraftPayload,
} from "@/db/queries";
import {
  createInboundLead,
  refreshInboundProjectBrief,
  sendInboundReceipt,
  type InboundLeadPayload,
} from "@/lib/inbound-create";
import { marketingPublicBaseUrl } from "@/lib/portal-host";
import { recordAuditSafe } from "@/lib/audit";
import type { ClientSource } from "@/db/schema";

const VERIFY_HOURS = 48;

export function hashInboundToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function newToken() {
  return randomBytes(32).toString("base64url");
}

function isUniqueViolation(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 6; depth += 1) {
    if (!current || typeof current !== "object") {
      return false;
    }
    const record = current as {
      code?: unknown;
      message?: unknown;
      cause?: unknown;
    };
    if (record.code === "23505") {
      return true;
    }
    if (
      typeof record.message === "string" &&
      record.message.includes("inbound_lead_drafts_email_open_uidx")
    ) {
      return true;
    }
    current = record.cause;
  }
  return false;
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

function toPayload(brief: InboundDraftBrief): InboundLeadPayload {
  return {
    name: brief.name,
    email: brief.email.trim().toLowerCase(),
    phone: brief.phone,
    organisation: brief.organisation,
    source: brief.source,
    sourceOther: brief.sourceOther,
    problem: brief.problem,
    wantBuilt: brief.wantBuilt,
    whoFor: brief.whoFor,
    successLooksLike: brief.successLooksLike,
    timeline: brief.timeline,
    budget: brief.budget,
  };
}

function verifyUrlFor(token: string) {
  return `${marketingPublicBaseUrl()}/start/continue?token=${encodeURIComponent(token)}`;
}

function tokenPayload(
  brief: InboundDraftBrief,
  token: string,
  expiresAt: Date,
  projectId?: string | null,
) {
  return {
    name: brief.name,
    phone: brief.phone,
    organisation: brief.organisation,
    source: brief.source,
    sourceOther: brief.sourceOther,
    problem: brief.problem,
    wantBuilt: brief.wantBuilt,
    whoFor: brief.whoFor,
    successLooksLike: brief.successLooksLike,
    timeline: brief.timeline,
    budget: brief.budget,
    verifyTokenHash: hashInboundToken(token),
    expiresAt,
    ...(projectId ? { projectId } : {}),
  };
}

async function loadOpenDraft(email: string) {
  return getInboundLeadDraftByEmailOpen(email);
}

async function insertOpenDraft(
  brief: InboundDraftBrief,
  email: string,
  token: string,
  expiresAt: Date,
) {
  try {
    const draftId = await createInboundLeadDraft({
      email,
      ...tokenPayload(brief, token, expiresAt),
    });
    return { draftId, reused: false as const };
  } catch (error) {
    if (!isUniqueViolation(error)) {
      throw error;
    }
    const existing = await loadOpenDraft(email);
    if (!existing) {
      throw error;
    }
    return { draftId: existing.id, reused: true as const, existing };
  }
}

async function discardForkedLead(created: {
  clientId: string;
  projectId: string;
}) {
  try {
    await deleteProject(created.projectId);
    await deleteClient(created.clientId);
  } catch (error) {
    console.error("Inbound lead fork cleanup failed", error);
  }
}

/**
 * Save the lead on Desk immediately (inactive) and email a confirm link.
 * One open draft per email; concurrent submits reuse that project.
 */
export async function issueInboundVerifyDraft(input: InboundDraftBrief): Promise<{
  draftId: string;
  verifyUrl: string;
  expiresAt: Date;
  projectId: string;
}> {
  const email = input.email.trim().toLowerCase();
  const token = newToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + VERIFY_HOURS);
  const payload = toPayload({ ...input, email });

  const existing = await loadOpenDraft(email);
  let draftId = existing?.id ?? null;

  if (!draftId) {
    const inserted = await insertOpenDraft(input, email, token, expiresAt);
    draftId = inserted.draftId;
  }

  const open = existing ?? (await loadOpenDraft(email));
  if (!open) {
    throw new Error("Could not save inbound draft");
  }
  draftId = open.id;

  if (open.projectId) {
    await refreshInboundProjectBrief(open.projectId, payload);
    await upsertInboundLeadDraftPayload(
      draftId,
      tokenPayload(input, token, expiresAt, open.projectId),
    );
    return {
      draftId,
      verifyUrl: verifyUrlFor(token),
      expiresAt,
      projectId: open.projectId,
    };
  }

  const created = await createInboundLead(payload, {
    status: "inactive",
    notifyDesk: true,
    sendReceipt: false,
  });

  const attached = await attachInboundLeadDraftProjectIfNull(
    draftId,
    created.projectId,
  );
  if (!attached) {
    const winner = await loadOpenDraft(email);
    const winnerProjectId = winner?.projectId ?? created.projectId;
    if (winnerProjectId !== created.projectId) {
      await discardForkedLead(created);
    }
    await upsertInboundLeadDraftPayload(
      draftId,
      tokenPayload(input, token, expiresAt, winnerProjectId),
    );
    return {
      draftId,
      verifyUrl: verifyUrlFor(token),
      expiresAt,
      projectId: winnerProjectId,
    };
  }

  await upsertInboundLeadDraftPayload(
    draftId,
    tokenPayload(input, token, expiresAt, created.projectId),
  );

  return {
    draftId,
    verifyUrl: verifyUrlFor(token),
    expiresAt,
    projectId: created.projectId,
  };
}

async function confirmDraftProject(
  draft: {
    id: string;
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
    projectId: string | null;
  },
  actorEmail: string,
): Promise<{ alreadyDone: boolean; name: string; email: string }> {
  const claimed = await claimInboundLeadDraft(draft.id);
  let projectId = claimed?.projectId ?? draft.projectId;

  if (!projectId) {
    if (!claimed) {
      return { alreadyDone: true, name: draft.name, email: draft.email };
    }
    const created = await createInboundLead(toPayload(draft), {
      status: "active",
      notifyDesk: true,
      sendReceipt: true,
    });
    projectId = created.projectId;
    await attachInboundLeadDraftProject(draft.id, projectId);
    await addNote(
      projectId,
      `Email confirmed (${actorEmail}). Project is active.`,
    );
    return { alreadyDone: false, name: draft.name, email: draft.email };
  }

  await activateInboundProject(projectId);

  if (!claimed) {
    return { alreadyDone: true, name: draft.name, email: draft.email };
  }

  await recordAuditSafe({
    action: "inbound.confirm",
    summary: `Confirmed inbound email for ${draft.name} (${draft.email}).`,
    entityType: "project",
    entityId: projectId,
    projectId,
    actorEmail,
    after: { projectId, status: "active" },
  });

  await addNote(
    projectId,
    `Email confirmed (${actorEmail}). Project is active.`,
  );

  await sendInboundReceipt(toPayload(draft));

  return { alreadyDone: false, name: draft.name, email: draft.email };
}

/** Visitor confirm link — activate the existing inactive project. Idempotent. */
export async function finalizeInboundDraftFromToken(token: string): Promise<{
  name: string;
  email: string;
  alreadyDone: boolean;
} | null> {
  const draft = await getInboundLeadDraftByVerifyHash(hashInboundToken(token));
  if (!draft || draft.expiresAt.getTime() < Date.now()) {
    return null;
  }

  if (draft.completedAt) {
    if (draft.projectId) {
      await activateInboundProject(draft.projectId);
    }
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

  return confirmDraftProject(draft, "inbound@nusman.dev");
}

/** Desk operator confirms without the visitor opening the email. */
export async function confirmInboundDraftForProject(
  projectId: string,
  actorEmail: string,
): Promise<{ ok: true; alreadyDone: boolean } | { ok: false; error: string }> {
  const project = await getProject(projectId);
  if (!project) {
    return { ok: false, error: "That project is gone." };
  }

  const draft =
    (await getOpenInboundLeadDraftByProject(projectId)) ??
    (await getInboundLeadDraftByProject(projectId));

  if (!draft) {
    if (project.status === "inactive") {
      await activateInboundProject(projectId);
      await recordAuditSafe({
        action: "inbound.confirm",
        summary: `Manually activated inbound project (no draft row).`,
        entityType: "project",
        entityId: projectId,
        projectId,
        actorEmail,
        after: { projectId, status: "active" },
      });
      await addNote(
        projectId,
        `Email confirmed from Desk (${actorEmail}). Project is active.`,
      );
      return { ok: true, alreadyDone: false };
    }
    return {
      ok: false,
      error: "This project is not waiting on email confirmation.",
    };
  }

  if (draft.completedAt && project.status !== "inactive") {
    return { ok: true, alreadyDone: true };
  }

  const result = await confirmDraftProject(draft, actorEmail);
  if (project.status === "inactive") {
    await activateInboundProject(projectId);
  }
  return { ok: true, alreadyDone: result.alreadyDone };
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
    projectId: existing.projectId,
  });

  return {
    name: existing.name,
    verifyUrl: verifyUrlFor(token),
  };
}

export async function resendInboundVerifyForProject(projectId: string): Promise<{
  verifyUrl: string;
  name: string;
  email: string;
} | null> {
  const existing = await getOpenInboundLeadDraftByProject(projectId);
  if (!existing || existing.completedAt) {
    return null;
  }
  const issued = await resendInboundVerify(existing.email);
  if (!issued) {
    return null;
  }
  return { ...issued, email: existing.email };
}
