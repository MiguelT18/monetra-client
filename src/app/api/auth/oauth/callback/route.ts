import { NextRequest, NextResponse } from "next/server";
import { apiUrl, forwardSetCookies } from "@/lib/api";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(apiUrl("/api/auth/oauth/callback"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const result = await res.json();
  const response = NextResponse.json(result, { status: res.status });
  forwardSetCookies(res, response);

  if (res.ok && result.data?.user?.role) {
    const isProduction = process.env.NODE_ENV === "production";
    const roleCookie = `user_role=${result.data.user.role}; Path=/; Max-Age=${60 * 60}; SameSite=Lax${isProduction ? "; Secure" : ""}`;
    response.headers.append("Set-Cookie", roleCookie);
  }

  return response;
}
