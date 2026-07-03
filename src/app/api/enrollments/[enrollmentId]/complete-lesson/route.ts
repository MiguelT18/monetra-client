import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

function authHeaders(accessToken: string) {
  return {
    "Content-Type": "application/json",
    Cookie: `access_token=${accessToken}`,
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> },
) {
  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { enrollmentId } = await params;
  const body = await request.json();

  const res = await fetch(
    apiUrl(`/api/enrollments/${enrollmentId}/complete-lesson`),
    {
      method: "POST",
      headers: authHeaders(accessToken),
      body: JSON.stringify(body),
    },
  );

  const result = await res.json();
  return NextResponse.json(result, { status: res.ok ? 200 : res.status });
}
