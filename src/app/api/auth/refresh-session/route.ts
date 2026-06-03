import { NextRequest, NextResponse } from "next/server";
import { apiUrl, forwardSetCookies } from "@/lib/api";

async function refreshSession(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return { ok: false as const };
  }

  const res = await fetch(apiUrl("/api/auth/refresh-session"), {
    method: "POST",
    headers: {
      Cookie: `refresh_token=${refreshToken}`,
    },
  });

  if (!res.ok) {
    return { ok: false as const };
  }

  return { ok: true as const, res };
}

export async function GET(request: NextRequest) {
  const redirectTo =
    request.nextUrl.searchParams.get("redirect") ?? "/user/dashboard";

  const result = await refreshSession(request);

  if (!result.ok) {
    const response = NextResponse.redirect(new URL("/auth/login", request.url));
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    response.cookies.delete("user_role");
    return response;
  }

  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  forwardSetCookies(result.res, response);

  return response;
}

export async function POST(request: NextRequest) {
  const result = await refreshSession(request);

  if (!result.ok) {
    const response = NextResponse.json(
      { message: "No se pudo refrescar la sesión" },
      { status: 401 },
    );
    response.cookies.delete("access_token");
    response.cookies.delete("refresh_token");
    response.cookies.delete("user_role");
    return response;
  }

  const response = NextResponse.json(
    { message: "Sesión refrescada" },
    { status: 200 },
  );
  forwardSetCookies(result.res, response);

  return response;
}
