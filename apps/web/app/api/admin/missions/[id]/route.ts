import { NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "../../../../../lib/supabase/admin";
import { createServerSupabaseClient } from "../../../../../lib/supabase/server";
import { clubLiveEnabled, integrationsPaused } from "../../../../../lib/club-mode";

const bodySchema = z.object({ decision: z.enum(["approved", "rejected"]) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!clubLiveEnabled) return integrationsPaused();
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = bodySchema.safeParse(body);
  const { id } = await params;
  if (!parsed.success || !z.string().uuid().safeParse(id).success) return Response.json({ error: "Invalid review" }, { status: 400 });

  const session = await createServerSupabaseClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const admin = createAdminClient();
  const { data: allowed } = await admin.rpc("is_admin", { p_user_id: user.id });
  if (!allowed) return new Response("Forbidden", { status: 403 });
  const { data, error } = await admin.rpc("review_mission_progress", {
    p_progress_id: id, p_decision: parsed.data.decision, p_actor_id: user.id
  });
  if (error) return Response.json({ error: error.message }, { status: 422 });
  return Response.json({ review: data });
}
