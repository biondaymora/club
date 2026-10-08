import { NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { createServerSupabaseClient } from "../../../../lib/supabase/server";
import { clubLiveEnabled, integrationsPaused } from "../../../../lib/club-mode";

const bodySchema = z.object({ rewardId: z.string().uuid(), customerId: z.string().uuid(), idempotencyKey: z.string().uuid() });

export async function POST(request: NextRequest) {
  if (!clubLiveEnabled) return integrationsPaused();
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Invalid redemption payload" }, { status: 400 });
  const sessionClient = await createServerSupabaseClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user || user.id !== parsed.data.customerId) return new Response("Unauthorized", { status: 401 });
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("redeem_reward", {
    p_reward_id: parsed.data.rewardId,
    p_customer_id: parsed.data.customerId,
    p_idempotency_key: parsed.data.idempotencyKey
  });
  if (error) return Response.json({ error: error.message }, { status: 422 });
  return Response.json({ redemption: data }, { status: 201 });
}
