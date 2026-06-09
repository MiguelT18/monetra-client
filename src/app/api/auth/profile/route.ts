import { NextRequest, NextResponse } from "next/server";
import { apiUrl, authHeaders } from "@/lib/api";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const res = await fetch(apiUrl("/api/auth/get-profile"), {
    method: "GET",
    headers: authHeaders(accessToken, refreshToken),
  });

  const result = await res.json();
  const response = NextResponse.json(result, { status: res.ok ? 200 : res.status });

  const setCookieHeader = res.headers.getSetCookie();
  if (setCookieHeader?.length) {
    setCookieHeader.forEach((cookie) => {
      response.headers.append("Set-Cookie", cookie);
    });
  }

  return response;
}

export async function PUT(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();

  const res = await fetch(apiUrl("/api/auth/profile"), {
    method: "PUT",
    headers: authHeaders(accessToken, refreshToken),
    body: JSON.stringify(body),
  });

  const result = await res.json();
  const response = NextResponse.json(result, { status: res.ok ? 200 : res.status });

  const setCookieHeader = res.headers.getSetCookie();
  if (setCookieHeader?.length) {
    setCookieHeader.forEach((cookie) => {
      response.headers.append("Set-Cookie", cookie);
    });
  }

  return response;
}
