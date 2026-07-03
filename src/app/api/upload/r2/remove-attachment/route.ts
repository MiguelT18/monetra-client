import { NextRequest, NextResponse } from "next/server";
import { apiUrl, authHeaders } from "@/lib/api";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();

  const res = await fetch(apiUrl("/api/upload/r2/remove-attachment"), {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });

  const result = await res.json();
  return NextResponse.json(result, { status: res.ok ? 200 : res.status });
}
