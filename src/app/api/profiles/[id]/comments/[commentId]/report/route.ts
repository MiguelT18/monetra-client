import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const { id, commentId } = await params;
  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const res = await fetch(apiUrl(`/api/profiles/${id}/comments/${commentId}/report`), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `access_token=${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  const result = await res.json();

  return NextResponse.json(result, { status: res.ok ? 200 : res.status });
}
