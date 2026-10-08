import crypto from "node:crypto";
import { requireServerEnv } from "../env";

export type ShopifyOrder = {
  id: number;
  order_number: number;
  email?: string;
  customer?: { id: number; email?: string };
  total_price: string;
  currency: string;
  processed_at?: string;
  financial_status: string;
};

export function verifyShopifyHmac(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = crypto.createHmac("sha256", requireServerEnv("SHOPIFY_WEBHOOK_SECRET")).update(rawBody, "utf8").digest("base64");
  const received = Buffer.from(signature);
  const calculated = Buffer.from(expected);
  return received.length === calculated.length && crypto.timingSafeEqual(calculated, received);
}

export async function shopifyAdminFetch<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const domain = requireServerEnv("SHOPIFY_STORE_DOMAIN");
  const response = await fetch(`https://${domain}/admin/api/2026-10/graphql.json`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Shopify-Access-Token": requireServerEnv("SHOPIFY_ADMIN_ACCESS_TOKEN") },
    body: JSON.stringify({ query, variables })
  });
  if (!response.ok) throw new Error(`Shopify Admin API returned ${response.status}`);
  const body = await response.json() as { data?: T; errors?: unknown[] };
  if (body.errors?.length || !body.data) throw new Error("Shopify Admin API returned GraphQL errors");
  return body.data;
}
