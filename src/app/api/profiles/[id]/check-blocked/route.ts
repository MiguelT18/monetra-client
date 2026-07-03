import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const accessToken = request.cookies.get("access_token")?.value;

  const headers: Record<string, string> = {};
  if (accessToken) {
    headers.Cookie = `access_token=${accessToken}`;
  }

  const res = await fetch(apiUrl(`/api/profiles/${id}/check-blocked`), { headers });
  const result = await res.json();

  return NextResponse.json(result, { status: res.ok ? 200 : res.status });
}
