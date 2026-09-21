import {
  addNote,
  createClient,
  createDeskNotificationsForActiveUsers,
  createPerson,
  createProject,
  deleteClient,
  deleteProject,
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
import type { ClientSource } from "@/db/schema";

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

function projectTitle(organisation: string | null) {
  if (organisation) {
    return oneLine(`${organisation} — inbound`, 120);
  }
  return "Project Title";
}

/** Create client + person + project for a verified /start lead. */
export async function createInboundLead(
  payload: InboundLeadPayload,
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

  const clientNotes = [
    "Created from nusman.dev Start a project form.",
    `Heard about us: ${clientSourceLabel(source)}${sourceOther ? ` — ${sourceOther}` : ""}.`,
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

    projectId = await createProject({
      clientId,
      title: projectTitle(organisation),
      problemSentence: problem,
      successLooksLike,
      deadlineNote: timeline,
    });

    await upsertQualify(projectId, {
      outcome: "undecided",
      whoFor,
      painToday: problem,
      neededBy: timeline,
      budgetNote: budget,
      callAt: null,
      notes: [
        "Inbound lead — contact ASAP.",
        phone ? `Phone: ${phone}` : null,
        `Heard about us: ${clientSourceLabel(source)}${sourceOther ? ` — ${sourceOther}` : ""}.`,
        `Want built: ${wantBuilt}`,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    await addNote(
      projectId,
      [
        "Opened from public Start a project form (inbound).",
        "",
        `Contact: ${name} <${email}>${phone ? ` · ${phone}` : ""}`,
        organisation ? `Organisation: ${organisation}` : null,
        `Heard about us: ${clientSourceLabel(source)}${sourceOther ? ` — ${sourceOther}` : ""}`,
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
      summary: `Inbound lead from ${name} (${email}).`,
      entityType: "project",
      entityId: projectId,
      projectId,
      actorEmail: "inbound@nusman.dev",
      after: {
        clientId,
        projectId,
        source: "nusman.dev/start",
      },
    });

    const base = deskPublicBaseUrl();
    await createDeskNotificationsForActiveUsers({
      kind: "inbound",
      title: `Inbound lead: ${oneLine(name)}`,
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
