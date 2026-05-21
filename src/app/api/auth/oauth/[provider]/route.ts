import { NextResponse } from "next/server";
import { apiUrl } from "@/lib/api";

const ALLOWED = new Set(["google", "github"]);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  if (!ALLOWED.has(provider)) {
    return NextResponse.json({ message: "Proveedor no soportado" }, { status: 400 });
  }

  const res = await fetch(apiUrl(`/api/auth/oauth/${provider}`));
  const result = await res.json();
  return NextResponse.json(result, { status: res.status });
}
