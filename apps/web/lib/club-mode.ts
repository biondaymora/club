/** Keep the public Club in preview until migrations and integrations are verified. */
export const clubLiveEnabled = process.env.NEXT_PUBLIC_CLUB_MODE === "live";

export function integrationsPaused() {
  return Response.json({ error: "El Club está en vista previa; las integraciones aún no están activas." }, { status: 503 });
}
