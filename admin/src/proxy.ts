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
    pathname.startsWith("/auth/magic/")
  );
}

function isMagicPath(pathname: string) {
  return pathname === "/auth/magic" || pathname.startsWith("/auth/magic/");
}

function isDeskPublicApiPath(pathname: string) {
  return pathname === "/api/inbound-lead";
}

async function handlePortal(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const portalOrigin = `${portalPublicBaseUrl()}/`;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
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
    if (from !== "/") {
      login.searchParams.set("from", from);
    }
    const response = NextResponse.redirect(login);
    if (portalToken) {
      response.cookies.delete(PORTAL_SESSION_COOKIE);
    }
    response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  if (live && pathname === "/login") {
    const response = NextResponse.redirect(new URL("/projects", portalOrigin));
    response.cookies.delete(SESSION_COOKIE);
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
    return handlePortal(request);
  }

  // Local / same-origin: magic link and live portal sessions use Portal chrome
  // on localhost so we do not depend on portal.localhost DNS.
  if (process.env.NODE_ENV !== "production") {
    if (isMagicPath(request.nextUrl.pathname)) {
      return handlePortal(request);
    }
    const portalToken = await readPortalSessionToken(
      request.cookies.get(PORTAL_SESSION_COOKIE)?.value,
    );
    const portalLive = portalToken?.sessionId
      ? await portalSessionIsLive(portalToken.sessionId).catch(() => false)
      : false;
    if (portalLive) {
      return handlePortal(request);
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
