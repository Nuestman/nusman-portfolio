import { NextResponse, type NextRequest } from "next/server";
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
import { looksLikeEmail } from "@/lib/forms";
import {
  isHeardAboutSource,
  type HeardAboutSource,
} from "@/lib/form-options";
import { clientSourceLabel } from "@/lib/labels";
import { sendInboundLeadEmail, sendInboundLeadReceiptEmail } from "@/lib/inbound-email";
import { deskNotifyRecipients } from "@/lib/mail";
import {
  inboundIsBlocked,
  recordInboundAttempt,
} from "@/lib/inbound-rate-limit";
import type { ClientSource } from "@/db/schema";

export const dynamic = "force-dynamic";

const MAX_NAME = 120;
const MAX_ORG = 160;
const MAX_PROBLEM = 2000;
const MAX_WHO_FOR = 500;
const MAX_SUCCESS = 2000;
const MAX_SHORT = 200;
const MAX_SOURCE_OTHER = 200;

type InboundBody = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  organisation?: unknown;
  problem?: unknown;
  whoFor?: unknown;
  successLooksLike?: unknown;
  /** @deprecated Prefer problem / whoFor / successLooksLike */
  summary?: unknown;
  timeline?: unknown;
  budget?: unknown;
  source?: unknown;
  sourceOther?: unknown;
  website?: unknown;
};

function deskPublicBaseUrl(): string {
  const fromEnv = process.env.DESK_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }
  return "https://desk.nusman.dev";
}

function allowedOrigins(): string[] {
  const fromEnv = process.env.INBOUND_ALLOWED_ORIGINS?.trim();
  if (fromEnv) {
    return fromEnv
      .split(",")
      .map((item) => item.trim().replace(/\/$/, ""))
      .filter(Boolean);
  }
  if (process.env.NODE_ENV !== "production") {
    return [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:4173",
      "https://nusman.dev",
      "https://www.nusman.dev",
    ];
  }
  return ["https://nusman.dev", "https://www.nusman.dev"];
}

function corsHeaders(request: NextRequest): HeadersInit {
  const origin = request.headers.get("origin");
  const allowed = allowedOrigins();
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
  if (origin && allowed.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers.Vary = "Origin";
  }
  return headers;
}

function json(
  request: NextRequest,
  body: Record<string, unknown>,
  status = 200,
) {
  return NextResponse.json(body, {
    status,
    headers: corsHeaders(request),
  });
}

function asTrimmed(value: unknown, max: number): string {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim().slice(0, max);
}

function asOptional(value: unknown, max: number): string | null {
  const text = asTrimmed(value, max);
  return text || null;
}

/** Strip CR/LF and other controls so they cannot break email headers. */
function oneLine(value: string, max = 160): string {
  return value.replace(/[\r\n\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
}

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function notifyRecipients(): string[] {
  return deskNotifyRecipients();
}

function projectTitle(organisation: string | null) {
  if (organisation) {
    return oneLine(`${organisation} — inbound`, 120);
  }
  return "Project Title";
}

function originAllowed(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const allowed = allowedOrigins();
  // Browsers always send Origin on cross-site POSTs. Require it in production
  // so bare curl/scripts cannot bypass the allow-list.
  if (process.env.NODE_ENV === "production") {
    return Boolean(origin && allowed.includes(origin));
  }
  if (!origin) {
    return true;
  }
  return allowed.includes(origin);
}

export async function OPTIONS(request: NextRequest) {
  if (!originAllowed(request)) {
    return new NextResponse(null, { status: 403 });
  }
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) {
    return json(request, { ok: false, error: "Origin not allowed." }, 403);
  }

  const ip = clientIp(request);
  if (inboundIsBlocked(ip)) {
    return json(
      request,
      { ok: false, error: "Too many requests. Try again later." },
      429,
    );
  }

  let body: InboundBody;
  try {
    body = (await request.json()) as InboundBody;
  } catch {
    return json(request, { ok: false, error: "Invalid JSON body." }, 400);
  }

  // Honeypot — pretend success for bots; still burn rate quota
  if (asTrimmed(body.website, 200)) {
    recordInboundAttempt(ip);
    return json(request, { ok: true });
  }

  const name = asTrimmed(body.name, MAX_NAME);
  const email = asTrimmed(body.email, MAX_SHORT).toLowerCase();
  const phone = asOptional(body.phone, MAX_SHORT);
  const organisation = asOptional(body.organisation, MAX_ORG);
  const legacySummary = asTrimmed(body.summary, MAX_PROBLEM);
  const problem =
    asTrimmed(body.problem, MAX_PROBLEM) || legacySummary;
  const whoFor = asTrimmed(body.whoFor, MAX_WHO_FOR);
  const successLooksLike = asTrimmed(body.successLooksLike, MAX_SUCCESS);
  const timeline = asOptional(body.timeline, MAX_SHORT);
  const budget = asOptional(body.budget, MAX_SHORT);
  const sourceRaw = asTrimmed(body.source, 40);
  const sourceOther = asOptional(body.sourceOther, MAX_SOURCE_OTHER);

  if (name.length < 2) {
    return json(request, { ok: false, error: "Name is required." }, 400);
  }
  if (!looksLikeEmail(email)) {
    return json(request, { ok: false, error: "A valid email is required." }, 400);
  }
  if (problem.length < 10) {
    return json(
      request,
      { ok: false, error: "Tell us what the problem is (at least a short sentence)." },
      400,
    );
  }
  if (whoFor.length < 5) {
    return json(
      request,
      { ok: false, error: "Tell us who this is for." },
      400,
    );
  }
  if (successLooksLike.length < 10) {
    return json(
      request,
      { ok: false, error: "Tell us what success looks like." },
      400,
    );
  }
  if (!sourceRaw || !isHeardAboutSource(sourceRaw)) {
    return json(
      request,
      { ok: false, error: "Tell us how you heard about us." },
      400,
    );
  }
  const heardAbout: HeardAboutSource = sourceRaw;
  if (heardAbout === "other" && !sourceOther) {
    return json(
      request,
      { ok: false, error: "Please say how you heard about us." },
      400,
    );
  }

  const clientSource: ClientSource = heardAbout;
  const clientNotes = [
    "Created from nusman.dev Start a project form.",
    `Heard about us: ${clientSourceLabel(clientSource)}${sourceOther ? ` — ${sourceOther}` : ""}.`,
  ].join("\n");

  // Count only after validation so typos do not lock a real visitor out.
  recordInboundAttempt(ip);

  let clientId: string | null = null;
  let projectId: string | null = null;

  try {
    const clientName = organisation ?? name;
    clientId = await createClient({
      name: clientName,
      email,
      phone,
      organisation,
      source: clientSource,
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

    const title = projectTitle(organisation);
    projectId = await createProject({
      clientId,
      title,
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
        `Heard about us: ${clientSourceLabel(clientSource)}${sourceOther ? ` — ${sourceOther}` : ""}.`,
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
        `Heard about us: ${clientSourceLabel(clientSource)}${sourceOther ? ` — ${sourceOther}` : ""}`,
        timeline ? `Timeline: ${timeline}` : null,
        budget ? `Budget: ${budget}` : null,
        "",
        `Problem: ${problem}`,
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
      to: notifyRecipients(),
      name: oneLine(name),
      email,
      phone,
      organisation: organisation ? oneLine(organisation) : null,
      problem,
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
      whoFor,
      successLooksLike,
      timeline,
      budget,
      phone,
    });

    if (!receipt.sent && receipt.error) {
      console.error("Inbound lead receipt email failed", receipt.error);
    }

    // Do not return internal IDs to the public site.
    return json(request, { ok: true });
  } catch (error) {
    console.error("Inbound lead create failed", error);
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
    return json(
      request,
      {
        ok: false,
        error: "Could not save your request. Try again or email me.",
      },
      500,
    );
  }
}
