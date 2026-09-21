import {
  addNote,
  createClient,
  createDeskNotificationsForActiveUsers,
  createPerson,
  createProject,
  deleteClient,
  deleteProject,
  markPeopleEmailVerifiedByEmail,
  patchProject,
  upsertQualify,
} from "@/db/queries";
import { recordAuditSafe } from "@/lib/audit";
import { deskPublicBaseUrl, oneLine } from "@/lib/inbound-http";
import {
  sendInboundLeadEmail,
  sendInboundLeadReceiptEmail,
} from "@/lib/inbound-email";
import { clientSourceLabel } from "@/lib/labels";
import { deskNotifyRecipients } from "@/lib/mail";
import type { ClientSource, ProjectStatus } from "@/db/schema";

export type InboundLeadPayload = {
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

export type CreateInboundLeadOptions = {
  status?: Extract<ProjectStatus, "inactive" | "active">;
  notifyDesk?: boolean;
  sendReceipt?: boolean;
};

function projectTitle(organisation: string | null) {
  if (organisation) {
    return oneLine(`${organisation} — inbound`, 120);
  }
  return "Project Title";
}

function sourceLine(source: ClientSource, sourceOther: string | null) {
  return `Heard about us: ${clientSourceLabel(source)}${sourceOther ? ` — ${sourceOther}` : ""}.`;
}

/** Create client + person + project for a /start lead. */
export async function createInboundLead(
  payload: InboundLeadPayload,
  options: CreateInboundLeadOptions = {},
): Promise<{ clientId: string; projectId: string }> {
  const {
    name,
    email,
    phone,
    organisation,
    source,
    sourceOther,
    problem,
    wantBuilt,
    whoFor,
    successLooksLike,
    timeline,
    budget,
  } = payload;
  const status = options.status ?? "active";
  const notifyDesk = options.notifyDesk ?? true;
  const sendReceipt = options.sendReceipt ?? true;

  const clientNotes = [
    "Created from nusman.dev Start a project form.",
    sourceLine(source, sourceOther),
  ].join("\n");

  let clientId: string | null = null;
  let projectId: string | null = null;

  try {
    const clientName = organisation ?? name;
    clientId = await createClient({
      name: clientName,
      email,
      phone,
      organisation,
      source,
      notes: clientNotes,
    });

    await createPerson({
      clientId,
      name,
      email,
      phone,
      role: "buyer",
      isDecisionMaker: true,
      notes: "Primary contact from inbound discovery form.",
    });
    if (status === "active") {
      await markPeopleEmailVerifiedByEmail(email);
    }

    projectId = await createProject({
      clientId,
      title: projectTitle(organisation),
      problemSentence: problem,
      wantBuilt,
      successLooksLike,
      deadlineNote: timeline,
      status,
    });

    await upsertQualify(projectId, {
      outcome: "undecided",
      whoFor,
      painToday: problem,
      neededBy: timeline,
      budgetNote: budget,
      callAt: null,
      notes: [
        status === "inactive"
          ? "Inbound lead — pending email confirmation."
          : "Inbound lead — contact ASAP.",
        phone ? `Phone: ${phone}` : null,
        sourceLine(source, sourceOther),
        `Want built: ${wantBuilt}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    await addNote(
      projectId,
      [
        "Opened from public Start a project form (inbound).",
        status === "inactive"
          ? "Status inactive until the visitor confirms their email (or Desk confirms it)."
          : null,
        "",
        `Contact: ${name} <${email}>${phone ? ` · ${phone}` : ""}`,
        organisation ? `Organisation: ${organisation}` : null,
        sourceLine(source, sourceOther),
        timeline ? `Timeline: ${timeline}` : null,
        budget ? `Budget: ${budget}` : null,
        "",
        `Problem: ${problem}`,
        `Want built: ${wantBuilt}`,
        `Who for: ${whoFor}`,
        `Success: ${successLooksLike}`,
      ]
        .filter((line) => line !== null)
        .join("\n"),
    );

    await recordAuditSafe({
      action: "inbound.lead",
      summary:
        status === "inactive"
          ? `Inbound lead from ${name} (${email}) — pending email confirmation.`
          : `Inbound lead from ${name} (${email}).`,
      entityType: "project",
      entityId: projectId,
      projectId,
      actorEmail: "inbound@nusman.dev",
      after: {
        clientId,
        projectId,
        source: "nusman.dev/start",
        status,
      },
    });

    if (notifyDesk) {
      const base = deskPublicBaseUrl();
      await createDeskNotificationsForActiveUsers({
        kind: "inbound",
        title:
          status === "inactive"
            ? `Inbound lead pending email: ${oneLine(name)}`
            : `Inbound lead: ${oneLine(name)}`,
        body: organisation
          ? `${oneLine(organisation)} — ${problem.slice(0, 240)}`
          : problem.slice(0, 280),
        href: `/projects/${projectId}`,
        clientId,
        projectId,
      }).catch((error) => {
        console.error("Inbound lead in-app notify failed", error);
      });

      const mail = await sendInboundLeadEmail({
        to: deskNotifyRecipients(),
        name: oneLine(name),
        email,
        phone,
        organisation: organisation ? oneLine(organisation) : null,
        problem,
        wantBuilt,
        whoFor,
        successLooksLike,
        timeline,
        budget,
        projectUrl: `${base}/projects/${projectId}`,
        clientUrl: `${base}/clients/${clientId}`,
      });

      if (!mail.sent && mail.error) {
        console.error("Inbound lead email failed", mail.error);
      }
    }

    if (sendReceipt) {
      const receipt = await sendInboundLeadReceiptEmail({
        to: email,
        name: oneLine(name),
        organisation: organisation ? oneLine(organisation) : null,
        problem,
        wantBuilt,
        whoFor,
        successLooksLike,
        timeline,
        budget,
        phone,
      });

      if (!receipt.sent && receipt.error) {
        console.error("Inbound lead receipt email failed", receipt.error);
      }
    }

    return { clientId, projectId };
  } catch (error) {
    try {
      if (projectId) {
        await deleteProject(projectId);
      }
      if (clientId) {
        await deleteClient(clientId);
      }
    } catch (cleanupError) {
      console.error("Inbound lead cleanup failed", cleanupError);
    }
    throw error;
  }
}

export async function refreshInboundProjectBrief(
  projectId: string,
  payload: InboundLeadPayload,
) {
  await patchProject(projectId, {
    problemSentence: payload.problem,
    wantBuilt: payload.wantBuilt,
    successLooksLike: payload.successLooksLike,
    deadlineNote: payload.timeline,
  });
  await upsertQualify(projectId, {
    outcome: "undecided",
    whoFor: payload.whoFor,
    painToday: payload.problem,
    neededBy: payload.timeline,
    budgetNote: payload.budget,
    callAt: null,
    notes: [
      "Inbound lead — pending email confirmation.",
      payload.phone ? `Phone: ${payload.phone}` : null,
      sourceLine(payload.source, payload.sourceOther),
      `Want built: ${payload.wantBuilt}`,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}

export async function sendInboundReceipt(payload: InboundLeadPayload) {
  const receipt = await sendInboundLeadReceiptEmail({
    to: payload.email,
    name: oneLine(payload.name),
    organisation: payload.organisation
      ? oneLine(payload.organisation)
      : null,
    problem: payload.problem,
    wantBuilt: payload.wantBuilt,
    whoFor: payload.whoFor,
    successLooksLike: payload.successLooksLike,
    timeline: payload.timeline,
    budget: payload.budget,
    phone: payload.phone,
  });
  if (!receipt.sent && receipt.error) {
    console.error("Inbound lead receipt email failed", receipt.error);
  }
  return receipt;
}
