import { requireServerEnv } from "../env";

type OmnisendEvent = { email: string; eventName: string; properties: Record<string, unknown> };

async function omnisendFetch(path: string, init: RequestInit) {
  const response = await fetch(`https://api.omnisend.com/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", "Authorization": `Omnisend-API-Key ${requireServerEnv("OMNISEND_API_KEY")}`, "Omnisend-Version": "2026-03-15", ...init.headers }
  });
  if (!response.ok) throw new Error(`Omnisend returned ${response.status}`);
}

export async function upsertOmnisendProfile(email: string, properties: Record<string, unknown>) {
  await omnisendFetch("/contacts", { method: "POST", body: JSON.stringify({ identifiers: [{ type: "email", id: email }], customProperties: properties }) });
}

export async function sendOmnisendEvent(event: OmnisendEvent) {
  await omnisendFetch("/events", { method: "POST", body: JSON.stringify({ eventName: event.eventName, origin: "api", contact: { email: event.email }, properties: event.properties }) });
}
