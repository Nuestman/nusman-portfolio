import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSessionToken } from "@/lib/auth";
import { safeInternalPath } from "@/lib/paths";
import { sessionIsLive } from "@/lib/session-live";

export async function proxy(request: NextRequest) {
  const token = await readSessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const sessionId = token?.sessionId ?? null;
  const live = sessionId
    ? await sessionIsLive(sessionId).catch(() => false)
    : false;
  const isLogin = request.nextUrl.pathname === "/login";

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
    return response;
  }

  if (live && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logos/|favicon/|avatars/).*)"],
};
