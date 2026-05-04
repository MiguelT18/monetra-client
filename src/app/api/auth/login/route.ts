import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch("http://localhost:8000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const result = await res.json();

  if (!res.ok) {
    return NextResponse.json(result, { status: res.status });
  }

  const response = NextResponse.json(result, { status: 200 });

  // 👇 Reenviar las cookies que el backend seteó al browser
  const setCookieHeader = res.headers.getSetCookie();

  setCookieHeader.forEach((cookie) => {
    response.headers.append("Set-Cookie", cookie);
  });

  return response;
}
