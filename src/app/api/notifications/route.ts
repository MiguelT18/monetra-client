import { NextRequest, NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const { searchParams } = new URL(request.url);
  const offset = searchParams.get("offset");
  const limit = searchParams.get("limit");

  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const params = new URLSearchParams();
  if (offset) params.set("offset", offset);
  if (limit) params.set("limit", limit);
  const qs = params.toString();

  const res = await fetch(apiUrl(`/api/notifications${qs ? `?${qs}` : ""}`), {
    headers: {
      Cookie: `access_token=${accessToken}`,
    },
  });

  const result = await res.json();
  return NextResponse.json(result, { status: res.ok ? 200 : res.status });
}

export async function DELETE(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  const res = await fetch(apiUrl("/api/notifications"), {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Cookie: `access_token=${accessToken}`,
    },
  });

  const result = await res.json();
  return NextResponse.json(result, { status: res.ok ? 200 : res.status });
}
