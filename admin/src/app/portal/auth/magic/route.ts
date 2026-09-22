import { NextResponse, type NextRequest } from "next/server";
import {
  PORTAL_SESSION_COOKIE,
  PORTAL_SESSION_DAYS,
  portalSessionCookieOptions,
  signPortalSessionToken,
} from "@/lib/portal-auth";
import { recordAuditSafe } from "@/lib/audit";
import { portalPublicBaseUrl } from "@/lib/portal-host";
import { safeInternalPath } from "@/lib/paths";
import { createPortalSessionRow } from "@/db/queries";
import { consumePortalMagicToken } from "@/lib/portal-magic";

function portalRedirect(path: string) {
  return NextResponse.redirect(new URL(path, `${portalPublicBaseUrl()}/`));
}

export async function GET(request: NextRequest) {
  const token = (request.nextUrl.searchParams.get("token") ?? "").trim();
  const fromRaw = safeInternalPath(
    request.nextUrl.searchParams.get("from") ?? undefined,
  );
  const from = fromRaw === "/" ? "/projects" : fromRaw;

  // Always finish on the Portal origin — request.url can be localhost after rewrite.
  if (!token) {
    return portalRedirect("/login?notice=invalid-link");
  }

  const person = await consumePortalMagicToken(token);
  if (!person) {
    return portalRedirect("/login?notice=invalid-link");
  }

  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + PORTAL_SESSION_DAYS);
  const sessionId = await createPortalSessionRow({
    personId: person.id,
    expiresAt,
    userAgent: request.headers.get("user-agent"),
    ip,
  });

  const jwt = await signPortalSessionToken({
    personId: person.id,
    sessionId,
  });

  await recordAuditSafe({
    action: "portal.login",
    summary: `Portal signed in as ${person.name}.`,
    entityType: "person",
    entityId: person.id,
    actorEmail: person.email,
  });

  let destination = from;
  if (!person.portalOnboardingCompletedAt) {
    if (from !== "/projects" && from !== "/welcome") {
      destination = `/welcome?next=${encodeURIComponent(from)}`;
    } else {
      destination = "/welcome";
    }
  }

  const response = portalRedirect(destination);
  response.cookies.set(PORTAL_SESSION_COOKIE, jwt, portalSessionCookieOptions());
  response.cookies.delete("desk_session");
  return response;
}
