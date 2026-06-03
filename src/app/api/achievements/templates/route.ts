import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

function authHeaders(accessToken: string) {
  return {
    "Content-Type": "application/json",
    Cookie: `access_token=${accessToken}`,
  };
}

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const res = await fetch(apiUrl("/api/achievements/templates"), {
    method: "GET",
    headers: authHeaders(accessToken),
  });

  const result = await res.json();

  if (!res.ok) {
    return NextResponse.json(result, { status: res.status });
  }

  return NextResponse.json(result, { status: 200 });
}

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();

  const res = await fetch(apiUrl("/api/achievements/templates"), {
    method: "POST",
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });

  const result = await res.json();

  if (!res.ok) {
    return NextResponse.json(result, { status: res.status });
  }

  return NextResponse.json(result, { status: 201 });
}
