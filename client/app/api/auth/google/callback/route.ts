import { api } from "@/config/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  const response = await api.get(`/auth/google/callback?code=${code}`);
  const data = response.data;

  // Save token in cookie
  const response2 = NextResponse.redirect(process.env.NEXT_APP_URL!);
  response2.cookies.set("token", data.token, { path: "/" });

  return response2;
}
