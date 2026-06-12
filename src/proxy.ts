import { NextRequest, NextResponse } from "next/server";
import { ROLE_ROUTES } from "@/lib/user";

const PROTECTED_ROUTES = ["/user", "/profile"];
const AUTH_ROUTES_REDIRECT_IF_SESSION = ["/auth/login", "/auth/register"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const userRole = request.cookies.get("user_role")?.value;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = AUTH_ROUTES_REDIRECT_IF_SESSION.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtected && !accessToken) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    const refreshUrl = new URL("/api/auth/refresh-session", request.url);
    refreshUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(refreshUrl);
  }

  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  const matchedRoute = Object.keys(ROLE_ROUTES).find((route) =>
    pathname.startsWith(route),
  );

  if (matchedRoute && userRole) {
    const allowedRoles = ROLE_ROUTES[matchedRoute];
    if (!allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/profile/:path*", "/auth/:path*"],
};
