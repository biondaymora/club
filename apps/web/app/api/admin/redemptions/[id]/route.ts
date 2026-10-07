import { NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "../../../../../lib/supabase/admin";
import { createServerSupabaseClient } from "../../../../../lib/supabase/server";

const bodySchema = z.object({ status: z.enum(["fulfilled", "cancelled"]), externalReference: z.string().max(120).optional() });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Invalid operation" }, { status: 400 });
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return Response.json({ error: "Invalid redemption" }, { status: 400 });
  const sessionClient = await createServerSupabaseClient();
  const { data: { user } } = await sessionClient.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const admin = createAdminClient();
  const { data: allowed } = await admin.rpc("is_admin", { p_user_id: user.id });
  if (!allowed) return new Response("Forbidden", { status: 403 });
  const { data, error } = await admin.rpc("manage_reward_redemption", {
    p_redemption_id: id,
    p_status: parsed.data.status,
    p_actor_id: user.id,
    p_external_reference: parsed.data.externalReference ?? null
  });
  if (error) return Response.json({ error: error.message }, { status: 422 });
  return Response.json({ redemption: data });
}
