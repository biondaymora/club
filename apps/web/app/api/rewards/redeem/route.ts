import { NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { createServerSupabaseClient } from "../../../../lib/supabase/server";

const bodySchema = z.object({ rewardId: z.string().uuid(), customerId: z.string().uuid(), idempotencyKey: z.string().uuid() });

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json());
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
