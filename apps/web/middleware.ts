import type { NextRequest } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { clubLiveEnabled } from "./lib/club-mode";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (!clubLiveEnabled) {
    if (path === "/login" || path.startsWith("/auth/")) return NextResponse.redirect(new URL("/registro", request.url));
    return NextResponse.next();
  }
  if (path === "/club/demo" || path === "/admin/demo") return NextResponse.next();
  return updateSession(request);
}

export const config = { matcher: ["/club/:path*", "/admin/:path*", "/auth/:path*", "/login"] };
