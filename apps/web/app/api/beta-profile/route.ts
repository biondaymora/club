import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email().max(254), phone: z.string().trim().min(7).max(25) });

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const profile = profileSchema.safeParse({ name: form.get("name"), email: form.get("email"), phone: form.get("phone") });
  if (!profile.success) return NextResponse.redirect(new URL("/registro?error=datos", request.url), 303);
  const response = NextResponse.redirect(new URL("/club/demo", request.url), 303);
  response.cookies.set("bm_beta_profile", encodeURIComponent(JSON.stringify(profile.data)), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/" });
  return response;
}
