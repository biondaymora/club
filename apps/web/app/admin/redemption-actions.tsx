"use client";

import { useState } from "react";

export default function RedemptionActions({ redemptionId }: { redemptionId: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function update(status: "fulfilled" | "cancelled") {
    setLoading(true); setError("");
    const response = await fetch(`/api/admin/redemptions/${redemptionId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) { const body = await response.json(); setError(body.error ?? "No fue posible actualizar el canje."); setLoading(false); return; }
    window.location.reload();
  }
  return <div><button disabled={loading} onClick={() => update("fulfilled")}>Entregado</button><button disabled={loading} onClick={() => update("cancelled")}>Cancelar</button>{error && <small role="alert">{error}</small>}</div>;
}
