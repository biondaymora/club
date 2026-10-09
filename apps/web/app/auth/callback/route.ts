import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { localRedirect } from "../../../lib/security/local-redirect";
import { createAdminClient } from "../../../lib/supabase/admin";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = localRedirect(url.searchParams.get("next"), url.origin);
  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return NextResponse.redirect(new URL("/login?error=enlace", url.origin));
    if (url.searchParams.get("origen") === "web") {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return NextResponse.redirect(new URL("/login?error=enlace", url.origin));
      const admin = createAdminClient();
      const { data: existing, error: lookupError } = await admin.from("customer_profiles")
        .select("id,entry_source,shopify_customer_id").eq("id", user.id).maybeSingle();
      if (lookupError) return NextResponse.redirect(new URL("/registro?error=perfil", url.origin));
      if (!existing) {
        const { error: insertError } = await admin.from("customer_profiles")
          .insert({ id: user.id, email: user.email, entry_source: "web_subscription" });
        if (insertError) return NextResponse.redirect(new URL("/registro?error=perfil", url.origin));
      } else if (existing.entry_source === "direct" && !existing.shopify_customer_id) {
        const { error: updateError } = await admin.from("customer_profiles")
          .update({ entry_source: "web_subscription" }).eq("id", user.id);
        if (updateError) return NextResponse.redirect(new URL("/registro?error=perfil", url.origin));
      }
    }
  }
  return NextResponse.redirect(next);
}
