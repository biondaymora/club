import { NextRequest } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { sendOmnisendEvent } from "../../../../lib/integrations/omnisend";
import { requireServerEnv } from "../../../../lib/env";

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${requireServerEnv("CRON_SECRET")}`) return new Response("Unauthorized", { status: 401 });
  const supabase = createAdminClient();
  const { data: events, error } = await supabase.rpc("claim_outbox_events", { p_destination: "omnisend", p_limit: 25 });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  let delivered = 0;
  let failed = 0;
  for (const event of events ?? []) {
    try {
      await sendOmnisendEvent({ ...event.payload, eventID: event.id, eventTime: event.created_at });
      const { data: updated, error: updateError } = await supabase.from("outbox_events")
        .update({ status: "delivered", delivered_at: new Date().toISOString(), locked_at: null, lease_token: null, last_error: null })
        .eq("id", event.id).eq("lease_token", event.lease_token).select("id").maybeSingle();
      if (updateError || !updated) throw new Error(updateError?.message ?? "Outbox lease was lost");
      delivered += 1;
    } catch (error) {
      const retryMinutes = Math.min(2 ** event.attempts, 1440);
      const { error: updateError } = await supabase.from("outbox_events")
        .update({ status: "failed", available_at: new Date(Date.now() + retryMinutes * 60_000).toISOString(),
          locked_at: null, lease_token: null, last_error: error instanceof Error ? error.message : "Unknown error" })
        .eq("id", event.id).eq("lease_token", event.lease_token);
      if (updateError) console.error("Could not mark Omnisend event as failed", { id: event.id, error: updateError.message });
      failed += 1;
    }
  }
  return Response.json({ claimed: events?.length ?? 0, delivered, failed });
}
