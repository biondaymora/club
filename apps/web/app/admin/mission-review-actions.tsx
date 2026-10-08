"use client";

import { useState } from "react";

export default function MissionReviewActions({ progressId }: { progressId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function review(decision: "approved" | "rejected") {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/missions/${progressId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision })
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "No se pudo guardar la revisión.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar la revisión.");
      setLoading(false);
    }
  }

  return <div><button type="button" disabled={loading} onClick={() => review("approved")}>Aprobar</button>{" "}<button type="button" disabled={loading} onClick={() => review("rejected")}>Rechazar</button>{message && <small role="alert">{message}</small>}</div>;
}
