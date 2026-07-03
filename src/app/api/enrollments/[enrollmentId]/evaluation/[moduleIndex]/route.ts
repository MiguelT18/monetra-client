import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

function authHeaders(accessToken: string) {
  return {
    "Content-Type": "application/json",
    Cookie: `access_token=${accessToken}`,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string; moduleIndex: string }> },
) {
  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { enrollmentId, moduleIndex } = await params;

  const res = await fetch(
    apiUrl(`/api/enrollments/${enrollmentId}/evaluation/${moduleIndex}`),
    { headers: authHeaders(accessToken) },
  );

  const result = await res.json();
  return NextResponse.json(result, { status: res.ok ? 200 : res.status });
}
