import {
  deskNotifyRecipients,
  mailIsConfigured,
  practiceContactBlock,
  practiceContactEmail,
  sendResendEmail,
  type SendEmailResult,
} from "@/lib/mail";
import { portalPublicBaseUrl } from "@/lib/portal-host";

function oneLine(value: string, max = 160): string {
  return value.replace(/[\r\n\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);
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
  return sendResendEmail({
    to: input.to,
    subject: "Your Numan Usman portal sign-in link",
    text: [
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
    ].join("\n"),
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
  const lines = [
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
          `Or open ${portalUrl}/login anytime and request a fresh link.`,
        ].join("\n")
      : `Open ${portalUrl}/login and enter this email to get a sign-in link.`,
    "",
    "From the portal you can follow progress, share discovery answers, manage schedule, and message Usman.",
    "",
    "—",
    practiceContactBlock(),
  ];

  return sendResendEmail({
    to: input.to,
    subject: "Your nusman.dev client portal is ready",
    text: lines.join("\n"),
  });
}

export async function sendInboundLeadEmail(input: {
  to: string[];
  name: string;
  email: string;
  phone: string | null;
  organisation: string | null;
  problem: string;
  whoFor: string;
  successLooksLike: string;
  timeline: string | null;
  budget: string | null;
  projectUrl: string;
  clientUrl: string;
}): Promise<SendEmailResult> {
  const recipients = input.to.length > 0 ? input.to : deskNotifyRecipients();
  const lines = [
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
  ];

  return sendResendEmail({
    to: recipients,
    replyTo: input.email,
    subject: `Inbound lead: ${oneLine(input.name)}${input.organisation ? ` (${oneLine(input.organisation)})` : ""}`,
    text: lines.join("\n"),
  });
}

/** Receipt to the person who submitted Start a project. */
export async function sendInboundLeadReceiptEmail(input: {
  to: string;
  name: string;
  organisation: string | null;
  problem: string;
  whoFor: string;
  successLooksLike: string;
  timeline: string | null;
  budget: string | null;
  phone: string | null;
}): Promise<SendEmailResult> {
  const lines = [
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
  ];

  return sendResendEmail({
    to: input.to,
    replyTo: practiceContactEmail(),
    subject: "Got your project request — Numan Usman",
    text: lines.join("\n"),
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
  return sendResendEmail({
    to: input.to,
    subject: input.forDesk
      ? `Portal message: ${oneLine(input.projectTitle)}`
      : `New message on ${oneLine(input.projectTitle)}`,
    text: [
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
    ].join("\n"),
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
  return sendResendEmail({
    to: input.to,
    subject: input.forDesk
      ? `Schedule: ${oneLine(input.projectTitle)}`
      : `Schedule update — ${oneLine(input.projectTitle)}`,
    text: [
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
    ].join("\n"),
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
  return sendResendEmail({
    to: input.to,
    subject: input.done
      ? `Milestone done: ${oneLine(input.milestoneLabel)}`
      : `Milestone reopened: ${oneLine(input.milestoneLabel)}`,
    text: [
      greeting,
      "",
      input.done
        ? `A checkpoint on “${input.projectTitle}” was marked done:`
        : `A checkpoint on “${input.projectTitle}” was reopened:`,
      "",
      input.milestoneLabel,
      "",
      `See progress: ${input.projectUrl}`,
      "",
      "—",
      practiceContactBlock(),
    ].join("\n"),
  });
}

export async function sendPortalProjectStartedNotifyEmail(input: {
  to: string[];
  personName: string;
  clientName: string;
  projectTitle: string;
  problem: string;
  projectUrl: string;
}): Promise<SendEmailResult> {
  return sendResendEmail({
    to: input.to.length > 0 ? input.to : deskNotifyRecipients(),
    subject: `Portal project request: ${oneLine(input.projectTitle)}`,
    text: [
      `${input.personName} (${input.clientName}) started a project from the portal.`,
      "",
      `Title: ${input.projectTitle}`,
      "",
      "Problem:",
      input.problem,
      "",
      `Open on Desk: ${input.projectUrl}`,
    ].join("\n"),
  });
}

export { deskNotifyRecipients, deskPublicBaseUrl, portalPublicBaseUrl };
