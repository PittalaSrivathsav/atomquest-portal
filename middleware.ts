import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  getSessionCookieFromRequest,
  verifySessionInMiddleware,
} from "@/lib/auth/middleware-auth";
import { getSafeRedirectPath } from "@/lib/auth/redirect";
import { AUTH_SESSION_COOKIE, ROUTES } from "@/lib/constants";

export const runtime = "nodejs";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDashboard = pathname.startsWith("/dashboard");
  const isLogin = pathname === ROUTES.login;

  if (!isDashboard && !isLogin) {
    return NextResponse.next();
  }

  const hasCookie = Boolean(getSessionCookieFromRequest(request));
  const authenticated = hasCookie
    ? await verifySessionInMiddleware(request)
    : false;

  if (isDashboard && !authenticated) {
    const loginUrl = new URL(ROUTES.login, request.url);
    loginUrl.searchParams.set("redirect", pathname);

    const response = NextResponse.redirect(loginUrl);
    if (hasCookie) {
      response.cookies.delete(AUTH_SESSION_COOKIE);
    }
    return response;
  }

  if (isLogin && authenticated) {
    const redirectParam = request.nextUrl.searchParams.get("redirect");
    const safePath = getSafeRedirectPath(redirectParam) ?? ROUTES.dashboard;
    return NextResponse.redirect(new URL(safePath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
