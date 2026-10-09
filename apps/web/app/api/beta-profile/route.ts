import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const profileSchema = z.object({ name: z.string().trim().min(2).max(80) });

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const scenario = form.get("scenario") === "returning" ? "returning" : "new";
  const guest = form.get("guest") === "1";
  const profile = guest ? null : profileSchema.safeParse({ name: form.get("name") });
  if (profile && !profile.success) return NextResponse.redirect(new URL("/registro?error=datos", request.url), 303);
  const previewProfile = guest ? { name: "Invitada", scenario } : { name: profile?.data.name ?? "Invitada", scenario };
  const response = NextResponse.redirect(new URL("/club/demo?fresh=1", request.url), 303);
  response.cookies.set("bm_beta_profile", encodeURIComponent(JSON.stringify(previewProfile)), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8, path: "/" });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
