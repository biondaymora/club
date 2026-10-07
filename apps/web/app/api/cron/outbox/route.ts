import { NextRequest } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { sendOmnisendEvent } from "../../../../lib/integrations/omnisend";
import { requireServerEnv } from "../../../../lib/env";

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${requireServerEnv("CRON_SECRET")}`) return new Response("Unauthorized", { status: 401 });
  const supabase = createAdminClient();
  const { data: events, error } = await supabase.from("outbox_events").select("*").eq("destination", "omnisend").eq("status", "pending").lte("available_at", new Date().toISOString()).limit(25);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  for (const event of events ?? []) {
    try {
      await sendOmnisendEvent(event.payload);
      await supabase.from("outbox_events").update({ status: "delivered", delivered_at: new Date().toISOString(), attempts: event.attempts + 1 }).eq("id", event.id);
    } catch (error) {
      await supabase.from("outbox_events").update({ status: "failed", attempts: event.attempts + 1, last_error: error instanceof Error ? error.message : "Unknown error" }).eq("id", event.id);
    }
  }
  return Response.json({ processed: events?.length ?? 0 });
}
