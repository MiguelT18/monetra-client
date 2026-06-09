import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

async function setAuthCookiesFromResult(
  json: { data?: { access_token?: string; refresh_token?: string; user?: { role?: string } } },
  response: NextResponse,
) {
  const isProduction = process.env.NODE_ENV === "production";

  if (json.data?.access_token) {
    response.cookies.set("access_token", json.data.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
  }

  if (json.data?.refresh_token) {
    response.cookies.set("refresh_token", json.data.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
  }

  if (json.data?.user?.role) {
    response.cookies.set("user_role", json.data.user.role, {
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });
  }
}

async function refreshSession(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return { ok: false as const };
  }

  const res = await fetch(apiUrl("/api/auth/refresh-session"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-refresh-token": refreshToken,
    },
  });

  if (!res.ok) {
    return { ok: false as const };
  }

  const json = await res.json();
  return { ok: true as const, json };
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
  setAuthCookiesFromResult(result.json, response);
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
  setAuthCookiesFromResult(result.json, response);
  return response;
}
