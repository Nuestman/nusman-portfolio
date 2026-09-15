import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSessionToken } from "@/lib/auth";
import { safeInternalPath } from "@/lib/paths";

export async function proxy(request: NextRequest) {
  const session = await readSessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const isLogin = request.nextUrl.pathname === "/login";

  if (!session && !isLogin) {
    const login = new URL("/login", request.url);
    const from = safeInternalPath(
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );
    if (from !== "/") {
      login.searchParams.set("from", from);
    }
    return NextResponse.redirect(login);
  }

  if (session && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logos/|favicon/|avatars/).*)"],
};
