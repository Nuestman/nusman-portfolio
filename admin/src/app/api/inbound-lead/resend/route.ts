import type { NextRequest } from "next/server";
import { looksLikeEmail } from "@/lib/forms";
import { resendInboundVerify } from "@/lib/inbound-draft";
import { sendInboundVerifyEmail } from "@/lib/inbound-email";
import {
  asTrimmed,
  clientIp,
  inboundJson,
  inboundOptions,
  INBOUND_LIMITS,
  originAllowed,
} from "@/lib/inbound-http";
import {
  inboundIsBlocked,
  recordInboundAttempt,
} from "@/lib/inbound-rate-limit";
import { emailReady } from "@/lib/notify-email";

export const dynamic = "force-dynamic";

export async function OPTIONS(request: NextRequest) {
  return inboundOptions(request);
}

export async function POST(request: NextRequest) {
  if (!originAllowed(request)) {
    return inboundJson(request, { ok: false, error: "Origin not allowed." }, 403);
  }

  const ip = clientIp(request);
  if (inboundIsBlocked(ip)) {
    return inboundJson(
      request,
      { ok: false, error: "Too many requests. Try again later." },
      429,
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return inboundJson(request, { ok: false, error: "Invalid JSON body." }, 400);
  }

  const email = asTrimmed(body.email, INBOUND_LIMITS.short).toLowerCase();
  if (!looksLikeEmail(email)) {
    return inboundJson(
      request,
      { ok: false, error: "A valid email is required." },
      400,
    );
  }

  if (!emailReady()) {
    return inboundJson(
      request,
      { ok: false, error: "Email is not configured yet." },
      503,
    );
  }

  recordInboundAttempt(ip);

  const issued = await resendInboundVerify(email);
  // Always look successful to avoid email enumeration.
  if (!issued) {
    return inboundJson(request, { ok: true });
  }

  const mail = await sendInboundVerifyEmail({
    to: email,
    name: issued.name,
    verifyUrl: issued.verifyUrl,
  });

  if (!mail.sent) {
    console.error("Inbound verify resend failed", mail.error);
    return inboundJson(
      request,
      { ok: false, error: "Could not resend the email. Try again shortly." },
      502,
    );
  }

  return inboundJson(request, {
    ok: true,
    ...(process.env.NODE_ENV !== "production"
      ? { debugVerifyUrl: issued.verifyUrl }
      : {}),
  });
}
