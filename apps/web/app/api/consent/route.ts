import { NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "../../../lib/supabase/admin";
import { createServerSupabaseClient } from "../../../lib/supabase/server";
import { clubLiveEnabled, integrationsPaused } from "../../../lib/club-mode";

const bodySchema = z.object({ loyaltyEmail: z.boolean() });

export async function POST(request: NextRequest) {
  if (!clubLiveEnabled) return integrationsPaused();
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid consent" }, { status: 400 });

  const session = await createServerSupabaseClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const admin = createAdminClient();
  const { error } = await admin.from("customer_consents").insert({
    customer_id: user.id, purpose: "loyalty_email", granted: parsed.data.loyaltyEmail, source: "club_member_settings"
  });
  if (error) return Response.json({ error: "No pudimos guardar tu preferencia." }, { status: 500 });
  return Response.json({ loyaltyEmail: parsed.data.loyaltyEmail });
}
