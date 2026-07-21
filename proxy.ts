import { NextRequest, NextResponse } from "next/server";

// Next.js 16 renamed `middleware.ts` -> `proxy.ts` (exporting `proxy` instead
// of `middleware`). This only gates page navigation; each Route Handler also
// re-checks the session itself, since a matcher change here shouldn't be the
// only thing standing between an API route and an unauthenticated request.
const SESSION_COOKIE = "roomsync_session";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!hasSession && !isAuthPage) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL("/discover", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/discover", "/matches/:path*", "/profile", "/login", "/signup"],
};
