import { NextRequest, NextResponse } from "next/server";
import { apiUrl, authHeaders } from "@/lib/api";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  const res = await fetch(apiUrl("/api/auth/update-password"), {
    method: "POST",
    headers: {
      ...(accessToken ? authHeaders(accessToken, refreshToken) : {}),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const result = await res.json();
  const response = NextResponse.json(result, { status: res.status });

  if (res.ok && result.data?.access_token) {
    const isProduction = process.env.NODE_ENV === "production";

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
  }

  return response;
}
