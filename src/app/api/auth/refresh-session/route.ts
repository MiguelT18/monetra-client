import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const redirectTo =
    request.nextUrl.searchParams.get("redirect") ?? "/user/dashboard";

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    const res = await fetch("http://localhost:8000/api/auth/refresh-session", {
      method: "POST",
      headers: {
        Cookie: `refresh_token=${refreshToken}`,
      },
    });

    if (!res.ok) {
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url),
      );
      response.cookies.delete("access_token");
      response.cookies.delete("refresh_token");
      return response;
    }

    // El backend setea las cookies, solo las reenviamos al browser
    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    res.headers.getSetCookie().forEach((cookie) => {
      response.headers.append("Set-Cookie", cookie);
    });

    return response;
  } catch {
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    return response;
  }
}
