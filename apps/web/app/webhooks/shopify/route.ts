import { NextRequest } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { ShopifyOrder, verifyShopifyHmac } from "../../../lib/integrations/shopify";

export async function POST(request: NextRequest) {
  const topic = request.headers.get("x-shopify-topic");
  const webhookId = request.headers.get("x-shopify-webhook-id");
  if (!topic || !webhookId) return new Response("Missing Shopify headers", { status: 400 });
  const rawBody = await request.text();
  if (!verifyShopifyHmac(rawBody, request.headers.get("x-shopify-hmac-sha256"))) return new Response("Invalid signature", { status: 401 });
  const payload = JSON.parse(rawBody) as ShopifyOrder;
  const supabase = createAdminClient();
  const { error } = await supabase.from("webhook_events").insert({ provider: "shopify", provider_event_id: webhookId, topic, payload, status: "received" });
  if (error?.code === "23505") return new Response(null, { status: 200 });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  if (topic === "orders/paid") {
    const { error: processError } = await supabase.rpc("process_shopify_order", { p_order: payload, p_webhook_id: webhookId });
    if (processError) return Response.json({ error: processError.message }, { status: 500 });
  }
  return new Response(null, { status: 202 });
}
