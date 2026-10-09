import { describe, expect, it } from "vitest";
import { readDemoSnapshot } from "./demo-session";

describe("sesión local de la demostración", () => {
  it("recupera el progreso de una visita de prueba", () => {
    const raw = JSON.stringify({ balance: 150, ledgerEntries: [{ id: "test", event_type: "earn", amount: 150, occurred_at: "2026-10-08T12:00:00.000Z", metadata: {} }], demoCompletions: { review: 1 }, demoRedemptions: [], goalRewardId: "shipping" });
    expect(readDemoSnapshot(raw)?.balance).toBe(150);
    expect(readDemoSnapshot(raw)?.goalRewardId).toBe("shipping");
  });

  it("ignora sesiones corruptas o datos imposibles", () => {
    expect(readDemoSnapshot("{")).toBeNull();
    expect(readDemoSnapshot(JSON.stringify({ balance: -10, ledgerEntries: [], demoCompletions: {}, demoRedemptions: [], goalRewardId: null }))).toBeNull();
  });
});
