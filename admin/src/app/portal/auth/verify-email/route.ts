import { NextResponse, type NextRequest } from "next/server";
import { recordAuditSafe } from "@/lib/audit";
import { consumePersonEmailVerifyToken } from "@/lib/person-email-verify";
import { portalPublicBaseUrl } from "@/lib/portal-host";

function portalRedirect(path: string) {
  return NextResponse.redirect(new URL(path, `${portalPublicBaseUrl()}/`));
}

export async function GET(request: NextRequest) {
  const token = (request.nextUrl.searchParams.get("token") ?? "").trim();
  if (!token) {
    return portalRedirect("/login?notice=invalid-link");
  }

  const person = await consumePersonEmailVerifyToken(token);
  if (!person) {
    return portalRedirect("/login?notice=invalid-link");
  }

  await recordAuditSafe({
    action: "person.email-confirm-link",
    summary: `Confirmed email via link for ${person.name}.`,
    entityType: "person",
    entityId: person.id,
    actorEmail: person.email,
  });

  return portalRedirect("/login?notice=email-confirmed");
}
