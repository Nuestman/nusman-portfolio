import type { NextRequest } from "next/server";
import { looksLikeEmail } from "@/lib/forms";
import {
  isHeardAboutSource,
  type HeardAboutSource,
} from "@/lib/form-options";
import { issueInboundVerifyDraft } from "@/lib/inbound-draft";
import { sendInboundVerifyEmail } from "@/lib/inbound-email";
import {
  asOptional,
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
import type { ClientSource } from "@/db/schema";

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

  if (asTrimmed(body.website, 200)) {
    recordInboundAttempt(ip);
    return inboundJson(request, { ok: true });
  }

  const name = asTrimmed(body.name, INBOUND_LIMITS.name);
  const email = asTrimmed(body.email, INBOUND_LIMITS.short).toLowerCase();
  const phone = asOptional(body.phone, INBOUND_LIMITS.short);
  const organisation = asOptional(body.organisation, INBOUND_LIMITS.org);
  const sourceRaw = asTrimmed(body.source, 40);
  const sourceOther = asOptional(body.sourceOther, INBOUND_LIMITS.sourceOther);
  const problem = asTrimmed(body.problem, INBOUND_LIMITS.problem);
  const wantBuilt = asTrimmed(body.wantBuilt, INBOUND_LIMITS.problem);
  const whoFor = asTrimmed(body.whoFor, INBOUND_LIMITS.whoFor);
  const successLooksLike = asTrimmed(body.successLooksLike, INBOUND_LIMITS.success);
  const timeline = asOptional(body.timeline, INBOUND_LIMITS.short);
  const budget = asOptional(body.budget, INBOUND_LIMITS.short);

  if (name.length < 2) {
    return inboundJson(request, { ok: false, error: "Name is required." }, 400);
  }
  if (!looksLikeEmail(email)) {
    return inboundJson(
      request,
      { ok: false, error: "A valid email is required." },
      400,
    );
  }
  if (!sourceRaw || !isHeardAboutSource(sourceRaw)) {
    return inboundJson(
      request,
      { ok: false, error: "Tell us how you heard about us." },
      400,
    );
  }
  const heardAbout: HeardAboutSource = sourceRaw;
  if (
    (heardAbout === "other" || heardAbout === "social_media") &&
    !sourceOther
  ) {
    return inboundJson(
      request,
      {
        ok: false,
        error:
          heardAbout === "social_media"
            ? "Please say which platform."
            : "Please say how you heard about us.",
      },
      400,
    );
  }
  if (problem.length < 10) {
    return inboundJson(
      request,
      { ok: false, error: "Tell us what the problem is (at least a short sentence)." },
      400,
    );
  }
  if (wantBuilt.length < 10) {
    return inboundJson(
      request,
      {
        ok: false,
        error: "Tell us what you want built or fixed (at least a short sentence).",
      },
      400,
    );
  }
  if (whoFor.length < 5) {
    return inboundJson(
      request,
      { ok: false, error: "Tell us who this is for." },
      400,
    );
  }
  if (successLooksLike.length < 10) {
    return inboundJson(
      request,
      { ok: false, error: "Tell us what success looks like." },
      400,
    );
  }

  recordInboundAttempt(ip);

  try {
    const issued = await issueInboundVerifyDraft({
      name,
      email,
      phone,
      organisation,
      source: heardAbout as ClientSource,
      sourceOther,
      problem,
      wantBuilt,
      whoFor,
      successLooksLike,
      timeline,
      budget,
    });

    const canMail = emailReady();
    if (canMail) {
      const mail = await sendInboundVerifyEmail({
        to: email,
        name,
        verifyUrl: issued.verifyUrl,
      });
      if (!mail.sent) {
        console.error("Inbound verify email failed", mail.error);
        if (process.env.NODE_ENV === "production") {
          return inboundJson(
            request,
            {
              ok: false,
              error: "Could not send the confirmation email. Try again shortly.",
            },
            502,
          );
        }
      }
    } else if (process.env.NODE_ENV === "production") {
      return inboundJson(
        request,
        {
          ok: false,
          error:
            "Email is not configured yet. Please try again later or use Contact.",
        },
        503,
      );
    }

    return inboundJson(request, {
      ok: true,
      email,
      ...(process.env.NODE_ENV !== "production"
        ? { debugVerifyUrl: issued.verifyUrl }
        : {}),
    });
  } catch (error) {
    console.error("Inbound draft create failed", error);
    return inboundJson(
      request,
      { ok: false, error: "Could not save your details. Try again." },
      500,
    );
  }
}
