import { NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { createServerSupabaseClient } from "../../../../lib/supabase/server";
import { clubLiveEnabled, integrationsPaused } from "../../../../lib/club-mode";

const bodySchema = z.object({
  missionId: z.string().uuid(),
  evidenceUrl: z.string().trim().url().max(500).refine(value => new URL(value).protocol === "https:", "Use an HTTPS link"),
  note: z.string().trim().max(500).optional()
});

export async function POST(request: NextRequest) {
  if (!clubLiveEnabled) return integrationsPaused();
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response("Forbidden", { status: 403 });
  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "Revisa el enlace y vuelve a intentarlo." }, { status: 400 });

  const session = await createServerSupabaseClient();
  const { data: { user } } = await session.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  const admin = createAdminClient();
  const { data, error } = await admin.rpc("submit_mission_progress", {
    p_mission_id: parsed.data.missionId,
    p_customer_id: user.id,
    p_evidence_url: parsed.data.evidenceUrl,
    p_note: parsed.data.note ?? null
  });
  if (error) return Response.json({ error: error.message }, { status: 422 });
  return Response.json({ submission: data }, { status: 201 });
}
