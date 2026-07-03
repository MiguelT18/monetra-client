import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const res = await fetch(apiUrl(`/api/profiles/${id}/comments/count`));
  const result = await res.json();

  return NextResponse.json(result, { status: res.ok ? 200 : res.status });
}
