import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const res = await fetch(apiUrl(`/api/users/${encodeURIComponent(username)}/public-profile`));

  const result = await res.json();

  if (!res.ok) {
    return NextResponse.json(result, { status: res.status });
  }

  return NextResponse.json(result, { status: 200 });
}
