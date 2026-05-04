import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/user"];
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  if (isProtected && !accessToken) {
    // Sin refresh tampoco → login directo
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Tiene refresh → delegar al Route Handler
    const refreshUrl = new URL("/api/auth/refresh-session", request.url);
    refreshUrl.searchParams.set("redirect", pathname); // 👈 para volver al destino
    return NextResponse.redirect(refreshUrl);
  }

  if (isAuthRoute && accessToken) {
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // ⚠️ fix: era /auth/path*, debe ser /auth/:path*
  matcher: ["/user/:path*", "/auth/:path*"],
};
