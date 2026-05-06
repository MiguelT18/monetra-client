import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();

  const res = await fetch("http://localhost:8000/api/auth/role", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: `access_token=${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const result = await res.json();

  if (!res.ok) {
    return NextResponse.json(result, { status: res.status });
  }

  const response = NextResponse.json(result, { status: 200 });

  // 👇 actualizar la cookie del rol con el mismo mecanismo que el login
  const isProduction = process.env.NODE_ENV === "production";
  const roleCookie = `user_role=${body.role}; Path=/; Max-Age=${60 * 60}; SameSite=Lax${isProduction ? "; Secure" : ""}`;
  response.headers.append("Set-Cookie", roleCookie);

  return response;
}
