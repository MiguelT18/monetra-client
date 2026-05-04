import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(
    new URL(
      "/auth/login",
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000",
    ),
  );

  response.cookies.delete("access_token");
  response.cookies.delete("refresh_token");

  return response;
}
