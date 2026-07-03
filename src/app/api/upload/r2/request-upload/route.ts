import { NextRequest, NextResponse } from "next/server";
import { apiUrl, authHeaders } from "@/lib/api";

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const res = await fetch(apiUrl("/api/upload/r2/request-upload"), {
    method: "POST",
    headers: authHeaders(accessToken),
  });

  const result = await res.json();
  return NextResponse.json(result, { status: res.ok ? 200 : res.status });
}
