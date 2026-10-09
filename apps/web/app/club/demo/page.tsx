import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import ClubDashboard from "../club-dashboard";
import { parseDemoScenario } from "../../../lib/club-entry";
import { demoRewards } from "./reward-catalog";

const profileSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().email().optional(), scenario: z.enum(["new", "returning", "subscriber"]).optional() });


export default async function ClubDemoPage() {
  const raw = (await cookies()).get("bm_beta_profile")?.value;
  if (!raw) redirect("/registro");
  let parsed: unknown;
  try { parsed = JSON.parse(decodeURIComponent(raw)); } catch { redirect("/registro"); }
  const result = profileSchema.safeParse(parsed);
  if (!result.success) redirect("/registro");
  const profile = result.data;
  const scenario = parseDemoScenario(profile.scenario);
  const returning = scenario === "returning";
  const missions = [
    { id: "welcome-profile", code: "WELCOME_PROFILE", title: "Elige tu estilo en el Club", description: "Elige una preferencia de estilo una sola vez.", points_reward: 100, completed: returning },
    { id: "care-card", code: "CARE_CARD", title: "Lee la guía de cuidado del cuero", description: "Lee la guía cuando esté disponible; cuenta una vez.", points_reward: 50, completed: returning },
    { id: "second-step", code: "SECOND_STEP", title: "Haz tu segunda compra", description: "Compra otra pieza con el correo de tu Club.", points_reward: 250 },
    { id: "complete-look", code: "COMPLETE_THE_LOOK", title: "Compra un accesorio para tu pieza", description: "Compra un accesorio con el correo de tu Club.", points_reward: 150 },
    { id: "honest-review", code: "HONEST_REVIEW", title: "Publica una reseña de tu compra", description: "Escribe una reseña honesta y comparte su enlace público.", points_reward: 150 },
    { id: "real-walk", code: "REAL_WALK", title: "Comparte una historia de tu pieza", description: "Comparte el enlace de una historia original sobre una pieza comprada.", points_reward: 300 },
    { id: "walk-together", code: "WALK_TOGETHER", title: "Invita a una amiga al Club", description: "Cuenta si hace su primera compra válida tras tu invitación.", points_reward: 300 }
  ];
  const ledger = returning ? [{ id: "welcome", event_type: "earn", amount: 150, occurred_at: new Date().toISOString(), metadata: { source: "intro" } }, { id: "purchase", event_type: "earn", amount: 1090, occurred_at: new Date(Date.now() - 86400000 * 8).toISOString(), metadata: { source: "sample-purchase" } }] : [];
  return <ClubDashboard demo demoScenario={scenario} user={{ id: `beta-preview-${scenario}`, email: profile.email ?? "", name: profile.name }} account={{ id: "preview-account", points_balance: returning ? 1240 : 0, tier_code: "Esencia" }} rewards={demoRewards} missions={missions} ledger={ledger} />;
}
