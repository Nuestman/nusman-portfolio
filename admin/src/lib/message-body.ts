import sanitizeHtml from "sanitize-html";

export type MessageBodyFormat = "plain" | "html";

const MESSAGE_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "a",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "h2",
    "h3",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    ul: ["class"],
    ol: ["class"],
    li: ["class"],
    pre: ["class"],
    code: ["class"],
    table: ["class"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
  },
  allowedClasses: {
    ul: ["msg-checklist"],
    li: ["msg-checklist--checked"],
    pre: ["language-*"],
    code: ["language-*"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer",
      target: "_blank",
    }),
  },
};

/** True when the stored body looks like markup rather than plain text. */
export function messageBodyLooksRich(body: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(body);
}

export function sanitizeMessageHtml(html: string): string {
  return sanitizeHtml(html, MESSAGE_HTML_OPTIONS).trim();
}

/** Strip tags for list previews, notifications, and plain-mode switches. */
export function messageBodyPlainText(body: string): string {
  if (!body) {
    return "";
  }
  if (!messageBodyLooksRich(body)) {
    return body.replace(/\s+/g, " ").trim();
  }
  const withBreaks = body
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*p\s*>/gi, "\n")
    .replace(/<\/\s*h[23]\s*>/gi, "\n")
    .replace(/<\/\s*li\s*>/gi, "\n")
    .replace(/<\/\s*tr\s*>/gi, "\n")
    .replace(/<\/\s*t[dh]\s*>/gi, " ");
  return sanitizeHtml(withBreaks, { allowedTags: [], allowedAttributes: {} })
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+/g, " ")
    .trim();
}

export function isMessageBodyFormat(value: string): value is MessageBodyFormat {
  return value === "plain" || value === "html";
}

/**
 * Normalize a form message body before persistence.
 * Plain stays text; HTML is sanitized and rejected if empty of real text.
 */
export function normalizeMessageBody(
  raw: string,
  format: MessageBodyFormat,
): string {
  const value = raw.trim();
  if (!value) {
    return "";
  }
  if (format === "plain") {
    return value;
  }
  const cleaned = sanitizeMessageHtml(value);
  if (!messageBodyPlainText(cleaned)) {
    return "";
  }
  return cleaned;
}

export function readMessageBodyFromForm(formData: FormData): {
  body: string;
  format: MessageBodyFormat;
} {
  const formatRaw = String(formData.get("bodyFormat") ?? "plain").trim();
  const format: MessageBodyFormat = isMessageBodyFormat(formatRaw)
    ? formatRaw
    : "plain";
  const raw = String(formData.get("body") ?? "");
  return {
    format,
    body: normalizeMessageBody(raw, format),
  };
}
