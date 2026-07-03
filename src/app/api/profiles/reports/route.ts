import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function GET(
  request: NextRequest,
) {
  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";

  const res = await fetch(apiUrl(`/api/profiles/reports?page=${page}&limit=${limit}`), {
    headers: { Cookie: `access_token=${accessToken}` },
  });
  const result = await res.json();

  return NextResponse.json(result, { status: res.ok ? 200 : res.status });
}
