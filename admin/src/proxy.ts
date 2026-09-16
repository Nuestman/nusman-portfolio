import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSessionToken } from "@/lib/auth";
import {
  PORTAL_SESSION_COOKIE,
  readPortalSessionToken,
} from "@/lib/portal-auth";
import { portalPublicBaseUrl, requestIsPortal } from "@/lib/portal-host";
import { portalSessionIsLive } from "@/lib/portal-session-live";
import { safeInternalPath } from "@/lib/paths";
import { sessionIsLive } from "@/lib/session-live";

function isPortalPublicPath(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/auth/magic" ||
    pathname.startsWith("/auth/magic/") ||
    // Rewrite destinations can re-enter proxy; these must stay public too.
    pathname === "/portal" ||
    pathname === "/portal/login" ||
    pathname === "/portal/auth/magic" ||
    pathname.startsWith("/portal/auth/magic/")
  );
}

function isMagicPath(pathname: string) {
  return pathname === "/auth/magic" || pathname.startsWith("/auth/magic/");
}

function isDeskPublicApiPath(pathname: string) {
  return pathname === "/api/inbound-lead";
}

/**
 * Paths that exist in both the desk tree and `/portal/...`. Soft navigations
 * resolve the desk module from the browser URL; rewriting those requests to
 * `/portal/...` makes Next return 404. Serve them with NextResponse.next() and
 * branch inside the page via shouldServePortalUi().
 *
 * Keep this list tight: only routes that already have a dual-mode (or portal)
 * page at the public path. Other portal URLs still rewrite to `/portal/...`.
 */
function isSharedDeskPortalPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/projects" ||
    pathname.startsWith("/projects/")
  );
}

function isDeskExclusivePath(pathname: string) {
  return (
    pathname.startsWith("/clients") ||
    pathname.startsWith("/users") ||
    pathname.startsWith("/products") ||
    pathname.startsWith("/journal") ||
    pathname.startsWith("/activities") ||
    pathname.startsWith("/audit") ||
    pathname.startsWith("/export") ||
    // Exact `/log` or `/log/...` only — `/login` must not match.
    pathname === "/log" ||
    pathname.startsWith("/log/") ||
    pathname.startsWith("/portal-desk") ||
    pathname.startsWith("/settings")
  );
}

function isPortalTreePath(pathname: string) {
  return pathname === "/portal" || pathname.startsWith("/portal/");
}

async function handlePortal(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  // Prefer the request host for redirects so a wrong PORTAL_APP_URL cannot
  // bounce portal ↔ desk or http ↔ https in a loop.
  const portalOrigin = request.nextUrl.origin;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  // Desk-only URLs on a portal session (same-origin local) must not rewrite to
  // `/portal/clients/...` etc. Fall through to desk handling instead.
  if (isDeskExclusivePath(pathname)) {
    return null;
  }

  const portalToken = await readPortalSessionToken(
    request.cookies.get(PORTAL_SESSION_COOKIE)?.value,
  );
  const live = portalToken?.sessionId
    ? await portalSessionIsLive(portalToken.sessionId).catch(() => false)
    : false;
  const isPublic = isPortalPublicPath(pathname);

  if (!live && !isPublic) {
    const login = new URL("/login", portalOrigin);
    const from = safeInternalPath(`${pathname}${search}`);
    if (from !== "/" && !from.startsWith("/portal")) {
      login.searchParams.set("from", from);
    }
    const response = NextResponse.redirect(login);
    if (portalToken) {
      response.cookies.delete(PORTAL_SESSION_COOKIE);
    }
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (live && (pathname === "/login" || pathname === "/portal/login")) {
    const response = NextResponse.redirect(new URL("/projects", portalOrigin));
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  // Already on the portal App Router tree (rewrite destination re-entering
  // proxy, or a direct /portal/... hit). Never rewrite again — that produced
  // /login ↔ /portal/login redirect loops.
  if (isPortalTreePath(pathname)) {
    const response = NextResponse.next();
    if (request.cookies.has(SESSION_COOKIE)) {
      response.cookies.delete(SESSION_COOKIE);
    }
    return response;
  }

  if (isSharedDeskPortalPath(pathname)) {
    const response = NextResponse.next();
    if (request.cookies.has(SESSION_COOKIE)) {
      response.cookies.delete(SESSION_COOKIE);
    }
    return response;
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname =
    pathname === "/" ? "/portal" : `/portal${pathname}`;
  const response = NextResponse.rewrite(rewriteUrl);
  if (request.cookies.has(SESSION_COOKIE)) {
    response.cookies.delete(SESSION_COOKIE);
  }
  return response;
}

async function handleDesk(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/portal" || pathname.startsWith("/portal/")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const token = await readSessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const sessionId = token?.sessionId ?? null;
  const live = sessionId
    ? await sessionIsLive(sessionId).catch(() => false)
    : false;
  const isLogin = pathname === "/login";

  if (!live && !isLogin) {
    const login = new URL("/login", request.url);
    const from = safeInternalPath(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    if (from !== "/") {
      login.searchParams.set("from", from);
    }
    const response = NextResponse.redirect(login);
    if (token) {
      response.cookies.delete(SESSION_COOKIE);
    }
    response.cookies.delete(PORTAL_SESSION_COOKIE);
    return response;
  }

  if (live && isLogin) {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete(PORTAL_SESSION_COOKIE);
    return response;
  }

  const response = NextResponse.next();
  if (request.cookies.has(PORTAL_SESSION_COOKIE)) {
    response.cookies.delete(PORTAL_SESSION_COOKIE);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  // Public Desk API must not be rewritten under Portal host routing.
  if (isDeskPublicApiPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (requestIsPortal(request)) {
    const portalResponse = await handlePortal(request);
    if (portalResponse) {
      return portalResponse;
    }
    // Desk-exclusive path on the portal host — send them to Portal home.
    return NextResponse.redirect(new URL("/", request.nextUrl.origin));
  }

  // Local / same-origin: magic link and live portal sessions use Portal chrome
  // on localhost so we do not depend on portal.localhost DNS.
  if (process.env.NODE_ENV !== "production") {
    if (isMagicPath(request.nextUrl.pathname)) {
      const portalResponse = await handlePortal(request);
      if (portalResponse) {
        return portalResponse;
      }
    }
    const portalToken = await readPortalSessionToken(
      request.cookies.get(PORTAL_SESSION_COOKIE)?.value,
    );
    const portalLive = portalToken?.sessionId
      ? await portalSessionIsLive(portalToken.sessionId).catch(() => false)
      : false;
    if (portalLive) {
      const portalResponse = await handlePortal(request);
      if (portalResponse) {
        return portalResponse;
      }
      // Desk-exclusive path while a portal cookie is live: prefer Desk.
    }
  } else if (isMagicPath(request.nextUrl.pathname)) {
    // Production Desk host: send magic links to the Portal domain.
    return NextResponse.redirect(
      new URL(
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
        `${portalPublicBaseUrl()}/`,
      ),
    );
  }

  return handleDesk(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logos/|favicon/|avatars/|images/).*)",
  ],
};
