import {
  deskNotifyRecipients,
  mailIsConfigured,
  practiceContactBlock,
  practiceContactEmail,
  sendResendEmail,
  type SendEmailResult,
} from "@/lib/mail";
import {
  htmlMutedBlock,
  htmlParagraphs,
  renderBrandedEmailHtml,
} from "@/lib/email-brand";
import { messageBodyPlainText } from "@/lib/message-body";
import { portalPublicBaseUrl } from "@/lib/portal-host";

function oneLine(value: string, max = 160): string {
  return messageBodyPlainText(value)
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, max);
}

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

export function emailReady(): boolean {
  return mailIsConfigured();
}

export async function sendPortalMagicLinkEmail(input: {
  to: string;
  name: string;
  url: string;
}): Promise<SendEmailResult> {
  const text = [
    `Hi ${input.name},`,
    "",
    "Use this one-time link to open the client portal:",
    "",
    input.url,
    "",
    "It expires in 24 hours. If you did not ask for this, ignore the email.",
    "",
    "—",
    practiceContactBlock(),
  ].join("\n");

  return sendResendEmail({
    to: input.to,
    subject: "Your Numan Usman portal sign-in link",
    text,
    html: renderBrandedEmailHtml({
      eyebrow: "Portal",
      title: "Sign in to your portal",
      preheader: "Your one-time portal sign-in link (expires in 24 hours).",
      greeting: `Hi ${input.name},`,
      bodyHtml: htmlParagraphs([
        "Use this one-time link to open the client portal. It expires in 24 hours.",
        "If you did not ask for this, you can ignore the email.",
      ]),
      cta: { label: "Open portal", url: input.url },
    }),
  });
}

/** When portal access is turned on from Desk. */
export async function sendPortalAccessGrantedEmail(input: {
  to: string;
  name: string;
  clientName: string;
  magicUrl: string | null;
}): Promise<SendEmailResult> {
  const portalUrl = portalPublicBaseUrl();
  const loginUrl = `${portalUrl}/login`;
  const text = [
    `Hi ${input.name},`,
    "",
    `Portal access is ready for ${input.clientName}.`,
    "",
    input.magicUrl
      ? [
          "Use this one-time link to sign in (expires in 24 hours):",
          "",
          input.magicUrl,
          "",
          `Or open ${loginUrl} anytime and request a fresh link.`,
        ].join("\n")
      : `Open ${loginUrl} and enter this email to get a sign-in link.`,
    "",
    "From the portal you can follow progress, share discovery answers, manage schedule, and message Usman.",
    "",
    "—",
    practiceContactBlock(),
  ].join("\n");

  const bodyLines = [
    `Portal access is ready for ${input.clientName}.`,
    "From the portal you can follow progress, share discovery answers, manage schedule, and message Usman.",
  ];
  if (!input.magicUrl) {
    bodyLines.push(`Open ${loginUrl} and enter this email to get a sign-in link.`);
  } else {
    bodyLines.push(
      "Use the button below for a one-time sign-in (expires in 24 hours), or request a fresh link from the login page anytime.",
    );
  }

  return sendResendEmail({
    to: input.to,
    subject: "Your nusman.dev client portal is ready",
    text,
    html: renderBrandedEmailHtml({
      eyebrow: "Portal",
      title: "Your portal is ready",
      preheader: `Portal access is ready for ${input.clientName}.`,
      greeting: `Hi ${input.name},`,
      bodyHtml: htmlParagraphs(bodyLines),
      cta: {
        label: input.magicUrl ? "Sign in once" : "Go to portal login",
        url: input.magicUrl ?? loginUrl,
      },
    }),
  });
}

export async function sendInboundLeadEmail(input: {
  to: string[];
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  problem: string;
  wantBuilt: string;
  whoFor: string;
  successLooksLike: string;
  timeline: string | null;
  budget: string | null;
  projectUrl: string;
  clientUrl: string;
}): Promise<SendEmailResult> {
  const recipients = input.to.length > 0 ? input.to : deskNotifyRecipients();
  const text = [
    "New inbound project request from nusman.dev.",
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone ?? "—"}`,
    `Organisation: ${input.organisation ?? "—"}`,
    `Timeline: ${input.timeline ?? "—"}`,
    `Budget: ${input.budget ?? "—"}`,
    "",
    "Problem:",
    input.problem,
    "",
    "Want built:",
    input.wantBuilt,
    "",
    "Who it's for:",
    input.whoFor,
    "",
    "Success looks like:",
    input.successLooksLike,
    "",
    `Open project: ${input.projectUrl}`,
    `Open client: ${input.clientUrl}`,
    "",
    "Contact them ASAP.",
  ].join("\n");

  return sendResendEmail({
    to: recipients,
    replyTo: input.email,
    subject: `Inbound lead: ${oneLine(input.name)}${input.organisation ? ` (${oneLine(input.organisation)})` : ""}`,
    text,
    html: renderBrandedEmailHtml({
      eyebrow: "Desk",
      title: "New inbound project request",
      preheader: `Lead from ${input.name}${input.organisation ? ` (${input.organisation})` : ""}.`,
      bodyHtml:
        htmlMutedBlock([
          `Name: ${input.name}`,
          `Email: ${input.email}`,
          `Phone: ${input.phone ?? "—"}`,
          `Organisation: ${input.organisation ?? "—"}`,
          `Timeline: ${input.timeline ?? "—"}`,
          `Budget: ${input.budget ?? "—"}`,
        ]) +
        htmlParagraphs([
          "Problem:",
          input.problem,
          "Want built:",
          input.wantBuilt,
          "Who it's for:",
          input.whoFor,
          "Success looks like:",
          input.successLooksLike,
          "Contact them ASAP.",
        ]),
      cta: { label: "Open project on Desk", url: input.projectUrl },
      afterCtaHtml: htmlParagraphs([`Client record: ${input.clientUrl}`]),
    }),
  });
}

/** Receipt to the person who submitted Start a project. */
export async function sendInboundLeadReceiptEmail(input: {
  to: string;
  name: string;
  organisation: string | null;
  problem: string;
  wantBuilt: string;
  whoFor: string;
  successLooksLike: string;
  timeline: string | null;
  budget: string | null;
  phone: string | null;
}): Promise<SendEmailResult> {
  const text = [
    `Hi ${input.name},`,
    "",
    "Thanks for starting a project with me — I've got your request on my Desk and will review it soon, usually within a business day.",
    "",
    "Here's what you sent:",
    "",
    `Organisation: ${input.organisation ?? "—"}`,
    `Phone: ${input.phone ?? "—"}`,
    `Timeline: ${input.timeline ?? "—"}`,
    `Budget: ${input.budget ?? "—"}`,
    "",
    "Problem:",
    input.problem,
    "",
    "Want built:",
    input.wantBuilt,
    "",
    "Who it's for:",
    input.whoFor,
    "",
    "Success looks like:",
    input.successLooksLike,
    "",
    "No need to do anything else for now. I'll reply to this email or reach out using the contact you shared.",
    "",
    "If anything changes, just email me.",
    "",
    "—",
    practiceContactBlock(),
  ].join("\n");

  return sendResendEmail({
    to: input.to,
    replyTo: practiceContactEmail(),
    subject: "Got your project request — Numan Usman",
    text,
    html: renderBrandedEmailHtml({
      eyebrow: "Start a project",
      title: "Got your request",
      preheader:
        "Thanks for starting a project — I'll review it soon, usually within a business day.",
      greeting: `Hi ${input.name},`,
      bodyHtml:
        htmlParagraphs([
          "Thanks for starting a project with me — I've got your request on my Desk and will review it soon, usually within a business day.",
          "Here's what you sent:",
        ]) +
        htmlMutedBlock([
          `Organisation: ${input.organisation ?? "—"}`,
          `Phone: ${input.phone ?? "—"}`,
          `Timeline: ${input.timeline ?? "—"}`,
          `Budget: ${input.budget ?? "—"}`,
        ]) +
        htmlParagraphs([
          "Problem:",
          input.problem,
          "Want built:",
          input.wantBuilt,
          "Who it's for:",
          input.whoFor,
          "Success looks like:",
          input.successLooksLike,
          "No need to do anything else for now. I'll reply to this email or reach out using the contact you shared.",
          "If anything changes, just email me.",
        ]),
    }),
  });
}

export async function sendPortalMessageNotifyEmail(input: {
  to: string | string[];
  recipientName?: string;
  projectTitle: string;
  authorLabel: string;
  body: string;
  threadUrl: string;
  forDesk?: boolean;
}): Promise<SendEmailResult> {
  const greeting = input.recipientName ? `Hi ${input.recipientName},` : "Hi,";
  const preview = oneLine(input.body, 280);
  const subject = input.forDesk
    ? `Portal message: ${oneLine(input.projectTitle)}`
    : `New message on ${oneLine(input.projectTitle)}`;
  const text = [
    greeting,
    "",
    `${input.authorLabel} wrote on “${input.projectTitle}”:`,
    "",
    preview,
    "",
    `Open the thread: ${input.threadUrl}`,
    "",
    "—",
    practiceContactBlock(),
  ].join("\n");

  return sendResendEmail({
    to: input.to,
    subject,
    text,
    html: renderBrandedEmailHtml({
      eyebrow: input.forDesk ? "Desk" : "Portal",
      title: input.forDesk ? "New portal message" : "New message",
      preheader: `${input.authorLabel} wrote on “${input.projectTitle}”.`,
      greeting,
      bodyHtml:
        htmlParagraphs([
          `${input.authorLabel} wrote on “${input.projectTitle}”:`,
        ]) + htmlMutedBlock([preview]),
      cta: { label: "Open the thread", url: input.threadUrl },
    }),
  });
}

export async function sendScheduleNotifyEmail(input: {
  to: string | string[];
  recipientName?: string;
  projectTitle: string;
  headline: string;
  details: string[];
  actionUrl: string;
  forDesk?: boolean;
}): Promise<SendEmailResult> {
  const greeting = input.recipientName ? `Hi ${input.recipientName},` : "Hi,";
  const subject = input.forDesk
    ? `Schedule: ${oneLine(input.projectTitle)}`
    : `Schedule update — ${oneLine(input.projectTitle)}`;
  const text = [
    greeting,
    "",
    input.headline,
    "",
    ...input.details,
    "",
    `Open schedule: ${input.actionUrl}`,
    "",
    "—",
    practiceContactBlock(),
  ].join("\n");

  return sendResendEmail({
    to: input.to,
    subject,
    text,
    html: renderBrandedEmailHtml({
      eyebrow: "Schedule",
      title: input.headline,
      preheader: `${input.headline} — ${input.projectTitle}`,
      greeting,
      bodyHtml:
        htmlParagraphs([`Project: ${input.projectTitle}`]) +
        htmlMutedBlock(input.details.length > 0 ? input.details : ["—"]),
      cta: { label: "Open schedule", url: input.actionUrl },
    }),
  });
}

export async function sendMilestoneNotifyEmail(input: {
  to: string | string[];
  recipientName?: string;
  projectTitle: string;
  milestoneLabel: string;
  done: boolean;
  projectUrl: string;
}): Promise<SendEmailResult> {
  const greeting = input.recipientName ? `Hi ${input.recipientName},` : "Hi,";
  const subject = input.done
    ? `Milestone done: ${oneLine(input.milestoneLabel)}`
    : `Milestone reopened: ${oneLine(input.milestoneLabel)}`;
  const lead = input.done
    ? `A checkpoint on “${input.projectTitle}” was marked done:`
    : `A checkpoint on “${input.projectTitle}” was reopened:`;
  const text = [
    greeting,
    "",
    lead,
    "",
    input.milestoneLabel,
    "",
    `See progress: ${input.projectUrl}`,
    "",
    "—",
    practiceContactBlock(),
  ].join("\n");

  return sendResendEmail({
    to: input.to,
    subject,
    text,
    html: renderBrandedEmailHtml({
      eyebrow: "Progress",
      title: input.done ? "Milestone done" : "Milestone reopened",
      preheader: `${input.milestoneLabel} — ${input.projectTitle}`,
      greeting,
      bodyHtml:
        htmlParagraphs([lead]) + htmlMutedBlock([input.milestoneLabel]),
      cta: { label: "See progress", url: input.projectUrl },
    }),
  });
}

export async function sendStageNotifyEmail(input: {
  to: string | string[];
  recipientName?: string;
  projectTitle: string;
  fromLabel: string;
  toLabel: string;
  projectUrl: string;
}): Promise<SendEmailResult> {
  const greeting = input.recipientName ? `Hi ${input.recipientName},` : "Hi,";
  const lead = `“${input.projectTitle}” moved from ${input.fromLabel} to ${input.toLabel}.`;
  const text = [
    greeting,
    "",
    lead,
    "",
    `See progress: ${input.projectUrl}`,
    "",
    "—",
    practiceContactBlock(),
  ].join("\n");

  return sendResendEmail({
    to: input.to,
    subject: `Stage update: ${oneLine(input.projectTitle)}`,
    text,
    html: renderBrandedEmailHtml({
      eyebrow: "Progress",
      title: "Stage update",
      preheader: lead,
      greeting,
      bodyHtml:
        htmlParagraphs([`Project: ${input.projectTitle}`]) +
        htmlMutedBlock([`${input.fromLabel} → ${input.toLabel}`]),
      cta: { label: "See progress", url: input.projectUrl },
    }),
  });
}

export async function sendPortalProjectStartedNotifyEmail(input: {
  to: string[];
  personName: string;
  clientName: string;
  projectTitle: string;
  problem: string;
  wantBuilt: string;
  projectUrl: string;
}): Promise<SendEmailResult> {
  const text = [
    `${input.personName} (${input.clientName}) started a project from the portal.`,
    "",
    `Title: ${input.projectTitle}`,
    "",
    "Problem:",
    input.problem,
    "",
    "Want built:",
    input.wantBuilt,
    "",
    `Open on Desk: ${input.projectUrl}`,
  ].join("\n");

  return sendResendEmail({
    to: input.to.length > 0 ? input.to : deskNotifyRecipients(),
    subject: `Portal project request: ${oneLine(input.projectTitle)}`,
    text,
    html: renderBrandedEmailHtml({
      eyebrow: "Desk",
      title: "Portal project request",
      preheader: `${input.personName} started “${input.projectTitle}”.`,
      bodyHtml:
        htmlParagraphs([
          `${input.personName} (${input.clientName}) started a project from the portal.`,
        ]) +
        htmlMutedBlock([`Title: ${input.projectTitle}`]) +
        htmlParagraphs([
          "Problem:",
          input.problem,
          "Want built:",
          input.wantBuilt,
        ]),
      cta: { label: "Open on Desk", url: input.projectUrl },
    }),
  });
}

export async function sendInboundVerifyEmail(input: {
  to: string;
  name: string;
  verifyUrl: string;
}): Promise<SendEmailResult> {
  const text = [
    `Hi ${input.name},`,
    "",
    "Thanks for starting a project with me. Confirm your email to continue — it takes <10 seconds>.",
    "",
    `Confirm here: ${input.verifyUrl}`,
    "",
    "This link expires in 48 hours. If you did not start a project, you can ignore this email.",
    "",
    "—",
    practiceContactBlock(),
  ].join("\n");

  return sendResendEmail({
    to: input.to,
    replyTo: practiceContactEmail(),
    subject: "Confirm your email to complete your request.",
    text,
    html: renderBrandedEmailHtml({
      eyebrow: "Start a project",
      title: "Confirm your email",
      preheader: "This confirms your project request is real.",
      greeting: `Hi ${input.name},`,
      bodyHtml: htmlParagraphs([
        "Thanks for starting a project with me. Confirm your email, and I’ll review and respond within 24 hours.",
        "This link expires in 48 hours. If you did not start a project, you can ignore this email.",
      ]),
      cta: { label: "Confirm and complete", url: input.verifyUrl },
    }),
  });
}

export { deskNotifyRecipients, deskPublicBaseUrl, portalPublicBaseUrl };
