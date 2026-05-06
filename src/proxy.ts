import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/user"];
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

// rutas restringidas por rol
const ROLE_ROUTES: Record<string, string[]> = {
  "/user/courses": ["STUDENT"],
  "/user/dashboard": ["STUDENT", "AFFILIATE", "PRODUCER"],
  "/user/settings": ["STUDENT", "AFFILIATE", "PRODUCER"],
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const userRole = request.cookies.get("user_role")?.value;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

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

  // 👇 verificar acceso por rol
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
  matcher: ["/user/:path*", "/auth/:path*"],
};
