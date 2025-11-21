import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  const res = await fetch(
    `http://localhost:5000/auth/google/callback?code=${code}`
  );

  const data = await res.json();

  // Save token in cookie
  const response = NextResponse.redirect("http://localhost:3000/dashboard");
  response.cookies.set("token", data.token, { path: "/" });

  return response;
}
