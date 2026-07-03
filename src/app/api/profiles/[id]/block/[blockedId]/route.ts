import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; blockedId: string }> },
) {
  const { id, blockedId } = await params;
  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const res = await fetch(apiUrl(`/api/profiles/${id}/block/${blockedId}`), {
    method: "DELETE",
    headers: { Cookie: `access_token=${accessToken}` },
  });
  const result = await res.json();

  return NextResponse.json(result, { status: res.ok ? 200 : res.status });
}
