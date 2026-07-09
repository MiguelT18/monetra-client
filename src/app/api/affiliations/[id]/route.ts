import { NextRequest, NextResponse } from "next/server";
import { apiUrl, authHeaders } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) return NextResponse.json({ message: "No autorizado" }, { status: 401 });

  const { id } = await params;

  const res = await fetch(apiUrl(`/api/affiliations/${id}`), {
    headers: authHeaders(accessToken),
  });

  const result = await res.json();
  return NextResponse.json(result, { status: res.ok ? 200 : res.status });
}
