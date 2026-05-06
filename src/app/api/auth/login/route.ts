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

  // reenviar las cookies del backend
  const setCookieHeader = res.headers.getSetCookie();
  setCookieHeader.forEach((cookie) => {
    response.headers.append("Set-Cookie", cookie);
  });

  // 👇 agregar user_role con el mismo mecanismo
  const isProduction = process.env.NODE_ENV === "production";
  const roleCookie = `user_role=${result.data.user.role}; Path=/; Max-Age=${60 * 60}; SameSite=Lax${isProduction ? "; Secure" : ""}`;
  response.headers.append("Set-Cookie", roleCookie);

  return response;
}
