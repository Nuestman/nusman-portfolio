import type { NextRequest } from "next/server";

export function hostLooksLikePortal(hostHeader: string | null): boolean {
  if (process.env.FORCE_PORTAL === "1") {
    return true;
  }
  const host = (hostHeader ?? "").split(":")[0]?.toLowerCase() ?? "";
  return host.startsWith("portal.") || host === "portal.localhost";
}

export function requestIsPortal(request: NextRequest): boolean {
  return hostLooksLikePortal(request.headers.get("host"));
}

/** Base URL written into magic links (no trailing slash). */
export function portalPublicBaseUrl(): string {
  const fromEnv = process.env.PORTAL_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (process.env.FORCE_PORTAL === "1") {
    return "http://localhost:3001";
  }
  // Local: Portal chrome via portal.localhost (Desk stays on localhost).
  if (process.env.NODE_ENV !== "production") {
    return "http://portal.localhost:3000";
  }
  return "https://portal.nusman.dev";
}
