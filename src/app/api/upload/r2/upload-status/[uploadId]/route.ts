import { NextRequest, NextResponse } from "next/server";
import { apiUrl, authHeaders } from "@/lib/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ uploadId: string }> },
) {
  const { uploadId } = await params;
  const accessToken = request.cookies.get("access_token")?.value;

  const res = await fetch(apiUrl(`/api/upload/r2/upload-status/${uploadId}`), {
    method: "GET",
    headers: accessToken ? authHeaders(accessToken) : {},
  });

  const result = await res.json();
  return NextResponse.json(result, { status: res.ok ? 200 : res.status });
}
