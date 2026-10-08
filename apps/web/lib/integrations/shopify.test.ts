import crypto from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => vi.unstubAllEnvs());

describe("Shopify webhook signature", () => {
  it("accepts only an HMAC of the exact raw body", async () => {
    vi.stubEnv("SHOPIFY_WEBHOOK_SECRET", "test-only-secret");
    vi.resetModules();
    const { verifyShopifyHmac } = await import("./shopify");
    const body = '{"id":123,"total_price":"100000.00"}';
    const signature = crypto.createHmac("sha256", "test-only-secret").update(body).digest("base64");
    expect(verifyShopifyHmac(body, signature)).toBe(true);
    expect(verifyShopifyHmac(`${body} `, signature)).toBe(false);
    expect(verifyShopifyHmac(body, "invalid")).toBe(false);
    expect(verifyShopifyHmac(body, null)).toBe(false);
  });
});
