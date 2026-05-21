import { NextRequest, NextResponse } from "next/server";
import { apiUrl, forwardSetCookies } from "@/lib/api";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const cookie = request.headers.get("cookie") ?? "";

  const res = await fetch(apiUrl("/api/auth/update-password"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie,
    },
    body: JSON.stringify(body),
  });

  const result = await res.json();
  const response = NextResponse.json(result, { status: res.status });
  forwardSetCookies(res, response);
  return response;
}
