import { readFile } from "node:fs/promises";
import path from "node:path";

/** Inline CID — logo travels with the message, not a remote URL clients block. */
export const EMAIL_LOGO_CID = "nusman-logo";

const GOLD = "#B98C1B";
const GOLD_HOVER = "#a16207";
const INK = "#150F00";
const GRAY_50 = "#f9fafb";
const GRAY_200 = "#e5e7eb";
const GRAY_600 = "#4b5563";
const WHITE = "#ffffff";

function contactEmail(): string {
  return (
    process.env.PRACTICE_CONTACT_EMAIL?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    "nuestman@icloud.com"
  );
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

let cachedLogoBase64: string | null | undefined;

/** Load square logo once per cold start for CID attachment. */
export async function emailLogoAttachment(): Promise<{
  filename: string;
  content: string;
  content_id: string;
  content_type: string;
} | null> {
  if (cachedLogoBase64 === null) {
    return null;
  }
  if (cachedLogoBase64 === undefined) {
    try {
      const filePath = path.join(
        process.cwd(),
        "public",
        "logos",
        "nusman-logo-square.png",
      );
      const buffer = await readFile(filePath);
      cachedLogoBase64 = buffer.toString("base64");
    } catch (error) {
      console.error("Email logo attach failed", error);
      cachedLogoBase64 = null;
      return null;
    }
  }
  return {
    filename: "nusman-logo-square.png",
    content: cachedLogoBase64,
    content_id: EMAIL_LOGO_CID,
    content_type: "image/png",
  };
}

export type BrandedEmailBody = {
  /** Short eyebrow above the title (optional). */
  eyebrow?: string;
  title: string;
  preheader: string;
  greeting?: string;
  /** Safe HTML paragraphs / lists already escaped by caller where needed. */
  bodyHtml: string;
  cta?: { label: string; url: string };
  /** Extra HTML under the CTA. */
  afterCtaHtml?: string;
};

/**
 * Table-based layout: gold accent, ink type, CID logo + always-visible wordmark
 * so the brand still reads when the client hides images.
 */
export function renderBrandedEmailHtml(input: BrandedEmailBody): string {
  const contact = escapeHtml(contactEmail());
  const greeting = input.greeting
    ? `<p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:${INK};">${escapeHtml(input.greeting)}</p>`
    : "";
  const eyebrow = input.eyebrow
    ? `<p style="margin:0 0 8px;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:${GOLD};font-weight:600;">${escapeHtml(input.eyebrow)}</p>`
    : "";
  const cta = input.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 8px;">
        <tr>
          <td style="border-radius:8px;background:${GOLD};">
            <a href="${escapeHtml(input.cta.url)}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:600;color:${WHITE};text-decoration:none;border-radius:8px;">${escapeHtml(input.cta.label)}</a>
          </td>
        </tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${escapeHtml(input.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;family=Odibee+Sans&amp;display=swap" rel="stylesheet"/>
<!--[if mso]><style>body,table,td{font-family:Arial,sans-serif!important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:${GRAY_50};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(input.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${GRAY_50};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${WHITE};border:1px solid ${GRAY_200};border-radius:16px;overflow:hidden;">
          <tr>
            <td style="height:4px;line-height:4px;font-size:0;background:${GOLD};">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 28px 8px;background:${WHITE};">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="cid:${EMAIL_LOGO_CID}" width="48" height="48" alt="Numan Usman" style="display:block;width:48px;height:48px;border:0;outline:none;text-decoration:none;border-radius:8px;background:${GRAY_50};"/>
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-family:'Odibee Sans',Inter,Arial,Helvetica,sans-serif;font-size:22px;line-height:1.2;color:${INK};">Numan&nbsp;Usman</p>
                    <p style="margin:4px 0 0;font-size:12px;color:${GRAY_600};font-family:Inter,Arial,Helvetica,sans-serif;">nusman.dev</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;font-family:Arial,Helvetica,sans-serif;color:${INK};">
              ${eyebrow}
              <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:700;color:${INK};">${escapeHtml(input.title)}</h1>
              ${greeting}
              <div style="font-size:15px;line-height:1.55;color:${INK};">
                ${input.bodyHtml}
              </div>
              ${cta}
              ${input.afterCtaHtml ?? ""}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px 28px;border-top:1px solid ${GRAY_200};background:${GRAY_50};font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;color:${GRAY_600};">
              <p style="margin:0 0 4px;font-weight:600;color:${INK};">Numan Usman</p>
              <p style="margin:0;">
                <a href="mailto:${contact}" style="color:${GOLD_HOVER};text-decoration:underline;">${contact}</a>
                · <a href="https://nusman.dev" style="color:${GOLD_HOVER};text-decoration:underline;">nusman.dev</a>
                · <a href="https://portal.nusman.dev" style="color:${GOLD_HOVER};text-decoration:underline;">Portal</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function htmlParagraphs(lines: string[]): string {
  return lines
    .map((line) => {
      if (line === "") {
        return `<div style="height:12px;line-height:12px;font-size:0;">&nbsp;</div>`;
      }
      return `<p style="margin:0 0 12px;font-size:15px;line-height:1.55;color:${INK};">${escapeHtml(line)}</p>`;
    })
    .join("");
}

export function htmlMutedBlock(lines: string[]): string {
  const inner = lines.map((line) => escapeHtml(line)).join("<br/>");
  return `<div style="margin:0 0 16px;padding:14px 16px;border-radius:10px;background:${GRAY_50};border:1px solid ${GRAY_200};font-size:14px;line-height:1.5;color:${INK};">${inner}</div>`;
}
