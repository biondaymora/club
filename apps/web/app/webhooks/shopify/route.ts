import { NextRequest } from "next/server";
import { createAdminClient } from "../../../lib/supabase/admin";
import { verifyShopifyHmac } from "../../../lib/integrations/shopify";

const supportedTopics = new Set(["orders/paid", "orders/cancelled", "refunds/create"]);

export async function POST(request: NextRequest) {
  const topic = request.headers.get("x-shopify-topic");
  const webhookId = request.headers.get("x-shopify-webhook-id");
  if (!topic || !webhookId) return new Response("Missing Shopify headers", { status: 400 });
  const rawBody = await request.text();
  if (!verifyShopifyHmac(rawBody, request.headers.get("x-shopify-hmac-sha256"))) return new Response("Invalid signature", { status: 401 });
  if (!supportedTopics.has(topic)) return new Response(null, { status: 200 });
  let payload: Record<string, unknown>;
  try {
    const parsed: unknown = JSON.parse(rawBody);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid payload");
    payload = parsed as Record<string, unknown>;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("process_shopify_event", {
    p_topic: topic, p_payload: payload, p_webhook_id: webhookId
  });
  if (error) {
    console.error("Shopify webhook processing failed", { topic, webhookId, error: error.message });
    return new Response("Processing failed", { status: 503 });
  }
  if (data?.status === "needs_retry") return new Response("Order not ingested yet", { status: 503 });
  if (data?.status === "needs_review") {
    console.error("Shopify refund requires manual review", { topic, webhookId });
  }
  return new Response(null, { status: 200 });
}
