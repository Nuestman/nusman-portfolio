import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSessionToken } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const email = await readSessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  const isLogin = request.nextUrl.pathname === "/login";

  if (!email && !isLogin) {
    const login = new URL("/login", request.url);
    login.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(login);
  }

  if (email && isLogin) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logos/|favicon/).*)"],
};
