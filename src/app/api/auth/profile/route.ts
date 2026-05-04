import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const res = await fetch("http://localhost:8000/api/auth/get-profile", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `access_token=${accessToken}`,
    },
  });

  const result = await res.json();

  if (!res.ok) {
    return NextResponse.json(result, { status: res.status });
  }

  return NextResponse.json(result, { status: 200 });
}
