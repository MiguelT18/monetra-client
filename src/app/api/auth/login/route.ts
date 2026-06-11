import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(apiUrl("/api/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const result = await res.json();

  if (!res.ok) {
    return NextResponse.json(result, { status: res.status });
  }

  const response = NextResponse.json(result, { status: 200 });
  const isProduction = process.env.NODE_ENV === "production";

  // usar response.cookies.set() para mayor confiabilidad
  if (result.data?.access_token) {
    response.cookies.set("access_token", result.data.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    if (result.data?.refresh_token) {
      response.cookies.set("refresh_token", result.data.refresh_token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60,
      });
    }
  } else {
    // fallback: reenviar cookies desde el backend
    const setCookieHeader = res.headers.getSetCookie();
    setCookieHeader.forEach((cookie) => {
      response.headers.append("Set-Cookie", cookie);
    });
  }

  response.cookies.set("user_role", result.data.user.role, {
    httpOnly: false,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60,
  });

  return response;
}
