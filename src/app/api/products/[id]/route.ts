import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

function authHeaders(accessToken: string) {
  return {
    "Content-Type": "application/json",
    Cookie: `access_token=${accessToken}`,
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const res = await fetch(apiUrl(`/api/products/${id}`), {
    method: "PUT",
    headers: authHeaders(accessToken),
    body: JSON.stringify(body),
  });

  const result = await res.json();
  const status = res.ok ? 200 : res.status;
  return NextResponse.json(result, { status });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const res = await fetch(apiUrl(`/api/products/${id}`), {
    method: "DELETE",
    headers: authHeaders(accessToken),
  });

  const result = await res.json();
  const status = res.ok ? 200 : res.status;
  return NextResponse.json(result, { status });
}
