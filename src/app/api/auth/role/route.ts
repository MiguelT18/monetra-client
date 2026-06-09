import { NextRequest, NextResponse } from "next/server";
import { apiUrl, authHeaders } from "@/lib/api";

export async function PATCH(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();

  const res = await fetch(apiUrl("/api/auth/role"), {
    method: "PATCH",
    headers: authHeaders(accessToken, refreshToken),
    body: JSON.stringify(body),
  });

  const result = await res.json();
  const response = NextResponse.json(result, { status: res.ok ? 200 : res.status });

  const isProduction = process.env.NODE_ENV === "production";
  const roleCookie = `user_role=${body.role}; Path=/; Max-Age=${60 * 60}; SameSite=Lax${isProduction ? "; Secure" : ""}`;
  response.headers.append("Set-Cookie", roleCookie);

  const setCookieHeader = res.headers.getSetCookie();
  if (setCookieHeader?.length) {
    setCookieHeader.forEach((cookie) => {
      response.headers.append("Set-Cookie", cookie);
    });
  }

  return response;
}
