import { clubLiveEnabled } from "../../../lib/club-mode";

export async function GET() {
  return Response.json({ status: "ok", service: "bionda-mora-loyalty", mode: clubLiveEnabled ? "live" : "preview" });
}
