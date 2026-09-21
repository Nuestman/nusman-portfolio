import type { NextRequest } from "next/server";
import { finalizeInboundDraftFromToken } from "@/lib/inbound-draft";
import {
  asTrimmed,
  clientIp,
  inboundJson,
  inboundOptions,
  originAllowed,
} from "@/lib/inbound-http";
import {
  inboundIsBlocked,
  recordInboundAttempt,
} from "@/lib/inbound-rate-limit";

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

  const token = asTrimmed(body.token, 200);
  if (!token) {
    return inboundJson(
      request,
      { ok: false, error: "Verification link is missing." },
      400,
    );
  }

  recordInboundAttempt(ip);

  try {
    const result = await finalizeInboundDraftFromToken(token);
    if (!result) {
      return inboundJson(
        request,
        {
          ok: false,
          error:
            "This link is invalid or expired. Start again or request a new email.",
        },
        400,
      );
    }

    return inboundJson(request, {
      ok: true,
      name: result.name,
      email: result.email,
      alreadyDone: result.alreadyDone,
    });
  } catch (error) {
    console.error("Inbound verify finalize failed", error);
    return inboundJson(
      request,
      {
        ok: false,
        error: "Could not finish your request. Try the link again or email me.",
      },
      500,
    );
  }
}
