/** Shared Resend helpers for Desk + Portal transactional email. */

import { emailLogoAttachment } from "@/lib/email-brand";

export type SendEmailResult = {
  sent: boolean;
  configured: boolean;
  error?: string;
};

function stripEnvQuotes(value: string): string {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

export function resendApiKey(): string | null {
  const key = process.env.RESEND_API_KEY?.trim();
  return key || null;
}

/** Prefer DESK_FROM_EMAIL, then PORTAL_FROM_EMAIL. Must be a Resend-verified sender. */
export function mailFromAddress(): string | null {
  const raw =
    process.env.DESK_FROM_EMAIL?.trim() ||
    process.env.PORTAL_FROM_EMAIL?.trim() ||
    "";
  const from = stripEnvQuotes(raw);
  return from || null;
}

export function mailIsConfigured(): boolean {
  return Boolean(resendApiKey() && mailFromAddress());
}

export function practiceContactEmail(): string {
  return (
    process.env.PRACTICE_CONTACT_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    "nuestman@icloud.com"
  );
}

export function practiceContactBlock(): string {
  const email = practiceContactEmail();
  return [
    "Numan Usman",
    email,
    "https://nusman.dev",
    "Portal: https://portal.nusman.dev",
  ].join("\n");
}

export function deskNotifyRecipients(): string[] {
  const raw =
    process.env.LEAD_NOTIFY_TO?.trim() || process.env.ADMIN_EMAIL?.trim();
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((item) => stripEnvQuotes(item.trim()).toLowerCase())
    .filter((item) => item.includes("@"));
}

export async function sendResendEmail(input: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string | null;
  /** When true (default if html set), attach the brand logo as a CID inline image. */
  attachLogo?: boolean;
}): Promise<SendEmailResult> {
  const apiKey = resendApiKey();
  const from = mailFromAddress();
  if (!apiKey || !from) {
    return { sent: false, configured: false };
  }

  const to = (Array.isArray(input.to) ? input.to : [input.to])
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  if (to.length === 0) {
    return { sent: false, configured: true, error: "No recipients." };
  }

  const attachLogo = input.attachLogo ?? Boolean(input.html);
  const attachments: Array<{
    filename: string;
    content: string;
    content_id: string;
    content_type: string;
  }> = [];
  if (attachLogo && input.html) {
    const logo = await emailLogoAttachment();
    if (logo) {
      attachments.push(logo);
    }
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: input.subject,
        text: input.text,
        ...(input.html ? { html: input.html } : {}),
        ...(attachments.length > 0 ? { attachments } : {}),
        ...(input.replyTo ? { reply_to: input.replyTo } : {}),
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      return {
        sent: false,
        configured: true,
        error: body || `Resend returned ${response.status}`,
      };
    }

    return { sent: true, configured: true };
  } catch (error) {
    return {
      sent: false,
      configured: true,
      error: error instanceof Error ? error.message : "Email failed",
    };
  }
}
