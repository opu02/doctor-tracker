import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "dt_token";

/**
 * Cheap first gate: no session cookie -> go to /login.
 * The cookie is only *checked for presence* here; the API verifies the JWT on every request
 * and the app shell calls /auth/me, so a forged cookie never shows any data.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login") return NextResponse.next();

  if (!request.cookies.has(SESSION_COOKIE)) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|icon.svg|favicon.ico).*)"],
};
