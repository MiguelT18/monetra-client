import { NextRequest, NextResponse } from "next/server";
import { apiUrl, authHeaders } from "@/lib/api";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  const res = await fetch(apiUrl("/api/auth/logout"), {
    method: "POST",
    headers: accessToken
      ? authHeaders(accessToken)
      : { "Content-Type": "application/json" },
  });

  const result = await res.json();

  const response = NextResponse.json(result, { status: res.status });

  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");
  response.cookies.delete("user_role");

  return response;
}
